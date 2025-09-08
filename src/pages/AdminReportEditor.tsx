import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Send, 
  Save, 
  CheckCircle, 
  XCircle,
  Edit3,
  Database,
  Brain,
  Search,
  RefreshCw,
  Loader2
} from "lucide-react";
import { MarketResearchDisplay } from "@/components/ui/market-research-display";

export default function AdminReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matchingRequest, setMatchingRequest] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>({});
  const [marketResearch, setMarketResearch] = useState<any>({});
  const [adminComments, setAdminComments] = useState("");
  const [gptPrompt, setGptPrompt] = useState("");
  const [perplexityPrompt, setPerplexityPrompt] = useState("");
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [reReviewing, setReReviewing] = useState(false);
  const [regenGPTLoading, setRegenGPTLoading] = useState(false);
  const [regenPPLXLoading, setRegenPPLXLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch matching request without embedding to avoid ambiguous relationship error
      const { data: request, error: requestError } = await supabase
        .from('matching_requests')
        .select(`
          *,
          pdf_uploads(*)
        `)
        .eq('id', id)
        .single();

      if (requestError) throw requestError;

      // Fetch company data separately if company_id exists
      let companyData = null;
      if (request.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', request.company_id)
          .single();
        companyData = company;
      }

      // Merge company data into request
      const requestWithCompany = {
        ...request,
        companies: companyData
      };

      setMatchingRequest(requestWithCompany);
      setAiAnalysis(request.ai_analysis || request.gpt_analysis || {});
      setMarketResearch(request.market_research || {});
      setAdminComments(request.admin_comments || "");
      setGptPrompt(request.gpt_prompt_used || "");
      setPerplexityPrompt(request.perplexity_prompt_used || "");

      // Fetch prompt templates
      const { data: templates } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true);

      setPromptTemplates(templates || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('matching_requests')
        .update({
          ai_analysis: aiAnalysis,
          market_research: marketResearch,
          admin_comments: adminComments,
          admin_modifications: {
            modified_at: new Date().toISOString(),
            modified_sections: Object.keys(aiAnalysis)
          }
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "보고서가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReReview = async () => {
    if (!id) return;
    setReReviewing(true);
    try {
      const { error } = await supabase
        .from('matching_requests')
        .update({
          workflow_status: 'admin_review',
          admin_comments: `${new Date().toISOString()} 재검토 지정\n${adminComments || ''}`,
        })
        .eq('id', id);
      if (error) throw error;

      toast({
        title: '재검토로 전환',
        description: '리포트가 재검토 상태로 전환되었습니다.',
      });
      // Refresh local state
      await fetchData();
    } catch (e) {
      toast({ title: '재검토 실패', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setReReviewing(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('이 보고서를 승인하시겠습니까? 승인 후 고객에게 이메일이 발송됩니다.')) {
      return;
    }

    setSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('email', user?.email)
        .single();

      // Update status to approved
      const { error: updateError } = await supabase
        .from('matching_requests')
        .update({
          workflow_status: 'completed',
          status: 'completed',
          approved_at: new Date().toISOString(),
          approved_by: adminCompany?.id,
          final_report: {
            ai_analysis: aiAnalysis,
            market_research: marketResearch,
            admin_comments: adminComments,
            generated_at: new Date().toISOString()
          }
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Generate a public report token for viewing
      try {
        await supabase.rpc('generate_report_token', { p_id: Number(id) });
      } catch (tokenErr) {
        console.warn('Report token generation failed:', tokenErr);
        // Continue; email will still be sent and admin can retry token later
      }

      // Send notification email
      await supabase.functions.invoke('send-analysis-complete-email', {
        body: {
          companyId: matchingRequest.company_id,
          matchingRequestId: id,
          reportSummary: aiAnalysis.executive_summary || '분석이 완료되었습니다.'
        }
      });

      toast({
        title: "승인 완료",
        description: "보고서가 승인되고 고객에게 이메일이 발송되었습니다.",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: "승인 실패",
        description: "승인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('반려 사유를 입력하세요:');
    if (!reason) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('matching_requests')
        .update({
          workflow_status: 'rejected',
          status: 'pending',
          admin_comments: `반려 사유: ${reason}\n${adminComments}`
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "반려 완료",
        description: "보고서가 반려되었습니다.",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: "반려 실패",
        description: "반려 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateAnalysisSection = (section: string, value: any) => {
    setAiAnalysis({
      ...aiAnalysis,
      [section]: value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">보고서 검토 및 수정</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {matchingRequest?.companies?.company_name}
            </Badge>
            <Badge variant={matchingRequest?.workflow_status === 'admin_review' ? 'default' : 'secondary'}>
              {matchingRequest?.workflow_status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
          <Button 
            onClick={async () => {
              if (!id) return;
              setRegenGPTLoading(true);
              try {
                await supabase.functions.invoke('run-gpt-analysis', {
                  body: { matchingRequestId: Number(id), adminPrompt: adminComments }
                });
                toast({ title: 'GPT 재생성 시작', description: '분석이 다시 실행됩니다. 잠시 후 새로고침하세요.' });
                // Immediately refetch to pick up updates when ready
                await fetchData();
              } catch (e) {
                toast({ title: 'GPT 재생성 실패', description: (e as Error).message, variant: 'destructive' });
              } finally {
                setRegenGPTLoading(false);
              }
            }}
            variant="outline"
            disabled={regenGPTLoading}
          >
            {regenGPTLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>재생성…</>) : (<><RefreshCw className="w-4 h-4 mr-2"/>GPT 재생성</>)}
          </Button>
          <Button 
            onClick={async () => {
              if (!id) return;
              setRegenPPLXLoading(true);
              try {
                await supabase.functions.invoke('run-perplexity-analysis', {
                  body: { matchingRequestId: Number(id), adminPrompt: adminComments }
                });
                toast({ title: 'Perplexity 재조사 시작', description: '시장 조사가 다시 실행됩니다.' });
                await fetchData();
              } catch (e) {
                toast({ title: 'Perplexity 재조사 실패', description: (e as Error).message, variant: 'destructive' });
              } finally {
                setRegenPPLXLoading(false);
              }
            }}
            variant="outline"
            disabled={regenPPLXLoading}
          >
            {regenPPLXLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>재조사…</>) : (<><RefreshCw className="w-4 h-4 mr-2"/>Perplexity 재조사</>)}
          </Button>
          <Button onClick={handleReReview} disabled={reReviewing} variant="outline">
            <Edit3 className="w-4 h-4 mr-2" />
            재검토
          </Button>
          <Button onClick={handleReject} disabled={saving} variant="destructive">
            <XCircle className="w-4 h-4 mr-2" />
            반려
          </Button>
          <Button onClick={handleApprove} disabled={saving} className="bg-gradient-primary">
            <CheckCircle className="w-4 h-4 mr-2" />
            승인 및 발송
          </Button>
          <Button 
            onClick={async () => {
              try {
                await supabase.rpc('generate_report_token', { p_id: Number(id) });
                toast({ title: '링크 재발급 완료', description: '새 보고서 링크가 생성되었습니다.' });
              } catch (e) {
                toast({ title: '재발급 실패', description: '토큰 생성 중 오류가 발생했습니다.', variant: 'destructive' });
              }
            }} 
            variant="outline"
            disabled={saving}
          >
            링크 재발급
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">
            <Brain className="w-4 h-4 mr-2" />
            GPT 분석
          </TabsTrigger>
          <TabsTrigger value="market">
            <Search className="w-4 h-4 mr-2" />
            Perplexity 시장분석
          </TabsTrigger>
          <TabsTrigger value="comments">
            <Edit3 className="w-4 h-4 mr-2" />
            코멘트
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <Edit3 className="w-4 h-4 mr-2" />
            프롬프트
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            참고 데이터
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* GPT Analysis pretty display with fallback to market_research.gpt.data */}
          <MarketResearchDisplay 
            data={aiAnalysis || {}}
            title="GPT 종합 분석"
            description="GPT 기반 종합 분석 리포트"
            showLiveBadge={false}
          />
          {/* Removed raw JSON editors to keep Perplexity-like UI only */}

        </TabsContent>

        {/* Market Research Tab - Beautiful Display */}
        <TabsContent value="market" className="space-y-6">
          <div className="space-y-6">
            {/* Perplexity-first display; fallback to GPT market if needed */}
            {(() => {
              const hasTopLevelData = marketResearch && (marketResearch as any).data;
              const displayObj = hasTopLevelData ? marketResearch : ((marketResearch as any)?.gpt ? (marketResearch as any).gpt : marketResearch);
              const cits = (displayObj as any)?.citations || (displayObj as any)?.data?.citations;
              return (
                <MarketResearchDisplay 
                  data={displayObj}
                  citations={cits}
                  title="실시간 시장 조사 결과"
                  description="Perplexity AI 기반 최신 시장 분석 리포트"
                  showLiveBadge={true}
                />
              );
            })()}
            {/* Removed raw JSON editor (Perplexity-style only) */}
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>관리자 코멘트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                rows={8}
                placeholder="내부 코멘트 또는 고객 전달 메시지를 작성하세요."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} variant="outline">
                  <Save className="w-4 h-4 mr-2" /> 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GPT 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={gptPrompt}
                onChange={(e) => setGptPrompt(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perplexity 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={perplexityPrompt}
                onChange={(e) => setPerplexityPrompt(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>제출된 문서</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchingRequest?.pdf_uploads?.map((pdf: any) => (
                  <div key={pdf.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{pdf.file_name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {new Date(pdf.uploaded_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>엑셀 참조 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                AI 분석 시 참조된 엑셀 데이터베이스 정보가 여기에 표시됩니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
