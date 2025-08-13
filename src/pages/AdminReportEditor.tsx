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
  Search
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch matching request with company info
      const { data: request, error: requestError } = await supabase
        .from('matching_requests')
        .select(`
          *,
          companies(*),
          pdf_uploads(*)
        `)
        .eq('id', id)
        .single();

      if (requestError) throw requestError;

      setMatchingRequest(request);
      setAiAnalysis(request.ai_analysis || {});
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
          <Button onClick={handleReject} disabled={saving} variant="destructive">
            <XCircle className="w-4 h-4 mr-2" />
            반려
          </Button>
          <Button onClick={handleApprove} disabled={saving} className="bg-gradient-primary">
            <CheckCircle className="w-4 h-4 mr-2" />
            승인 및 발송
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">
            <Brain className="w-4 h-4 mr-2" />
            AI 분석 결과
          </TabsTrigger>
          <TabsTrigger value="market">
            <Search className="w-4 h-4 mr-2" />
            시장 조사
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <Edit3 className="w-4 h-4 mr-2" />
            프롬프트
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            참조 데이터
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>경영진 요약 (Executive Summary)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={aiAnalysis.executive_summary || aiAnalysis['경영진_요약'] || ''}
                onChange={(e) => updateAnalysisSection('executive_summary', e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>회사 분석 (Company Analysis)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(aiAnalysis.company_analysis || aiAnalysis['회사_분석'] || {}, null, 2)}
                onChange={(e) => {
                  try {
                    updateAnalysisSection('company_analysis', JSON.parse(e.target.value));
                  } catch (error) {
                    // Handle JSON parse error
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>매칭 추천 (Partner Recommendations)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(aiAnalysis.partner_recommendations || aiAnalysis['매칭_추천'] || [], null, 2)}
                onChange={(e) => {
                  try {
                    updateAnalysisSection('partner_recommendations', JSON.parse(e.target.value));
                  } catch (error) {
                    // Handle JSON parse error
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>관리자 의견</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                rows={4}
                placeholder="고객에게 전달할 추가 의견을 작성하세요..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Research Tab - Beautiful Display */}
        <TabsContent value="market" className="space-y-6">
          <div className="space-y-6">
            {/* Beautiful Display View */}
            <MarketResearchDisplay 
              data={marketResearch}
              citations={marketResearch?.citations}
            />
            
            {/* Raw JSON Editor (Collapsible) */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4" />
                원본 데이터 편집 (고급)
              </summary>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">JSON 데이터 편집기</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={JSON.stringify(marketResearch, null, 2)}
                    onChange={(e) => {
                      try {
                        setMarketResearch(JSON.parse(e.target.value));
                      } catch (error) {
                        // Handle JSON parse error
                      }
                    }}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </details>
          </div>
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