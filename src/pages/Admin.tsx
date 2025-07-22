import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Calendar, MapPin, Users, Globe, CheckCircle, XCircle, Clock, Mail,
  FileSpreadsheet, Brain, Upload, Edit, Trash2, Save, Plus, Settings
} from "lucide-react";

interface Company {
  id: number;
  company_name: string;
  ceo_name: string;
  manager_name: string;
  manager_position: string;
  email: string;
  phone_number: string;
  industry: string;
  headquarters_country: string;
  headquarters_city: string;
  founding_year: number;
  employee_count: string;
  revenue_scale: string;
  main_products: string;
  target_market: string;
  competitive_advantage: string;
  company_vision: string;
  website: string;
  is_approved: boolean;
  created_at: string;
  rejection_reason: string;
}

interface GPTPrompt {
  id: number;
  prompt_type: string;
  prompt_title: string;
  system_prompt: string;
  user_prompt_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MarketData {
  id: number;
  data_category: string;
  country?: string;
  industry?: string;
  data_content: any;
  source_file?: string;
  created_at: string;
  is_active: boolean;
}

interface PerplexityPrompt {
  id: number;
  prompt_type: string;
  prompt_title: string;
  system_prompt: string;
  user_prompt_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [prompts, setPrompts] = useState<GPTPrompt[]>([]);
  const [perplexityPrompts, setPerplexityPrompts] = useState<PerplexityPrompt[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<GPTPrompt | null>(null);
  const [selectedPerplexityPrompt, setSelectedPerplexityPrompt] = useState<PerplexityPrompt | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showPerplexityPromptDialog, setShowPerplexityPromptDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Partial<GPTPrompt>>({});
  const [editingPerplexityPrompt, setEditingPerplexityPrompt] = useState<Partial<PerplexityPrompt>>({});
  const [newDataEntry, setNewDataEntry] = useState({
    data_category: '',
    country: '',
    industry: '',
    data_content: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCompanies(),
      fetchPrompts(),
      fetchPerplexityPrompts(),
      fetchMarketData()
    ]);
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast({
        title: "기업 데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('gpt_prompts')
        .select('*')
        .order('prompt_type', { ascending: true });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast({
        title: "프롬프트 데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPerplexityPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('gpt_prompts')
        .select('*')
        .ilike('prompt_type', '%perplexity%')
        .order('prompt_type', { ascending: true });

      if (error) throw error;
      setPerplexityPrompts(data || []);
    } catch (error: any) {
      toast({
        title: "퍼플렉시티 프롬프트 데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
    }

  };

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarketData(data || []);
    } catch (error: any) {
      toast({
        title: "시장 데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (company: Company) => {
    setActionLoading(true);
    try {
      // Update company approval status
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          rejection_reason: null 
        })
        .eq('id', company.id);

      if (updateError) throw updateError;

      // Send approval email
      const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
        body: {
          companyId: company.id,
          type: 'approval'
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "승인 완료",
          description: "승인은 완료되었으나 이메일 발송에 실패했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "승인 완료",
          description: `${company.company_name}이 승인되었고 알림 이메일이 발송되었습니다.`,
        });
      }

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "승인 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCompany || !rejectionReason.trim()) {
      toast({
        title: "거부 사유 필요",
        description: "거부 사유를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      // Update company with rejection
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          is_approved: false,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedCompany.id);

      if (updateError) throw updateError;

      // Send rejection email
      const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
        body: {
          companyId: selectedCompany.id,
          type: 'rejection',
          rejectionReason: rejectionReason
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "거부 완료",
          description: "거부는 완료되었으나 이메일 발송에 실패했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "거부 완료",
          description: `${selectedCompany.company_name}이 거부되었고 알림 이메일이 발송되었습니다.`,
        });
      }

      setShowRejectDialog(false);
      setSelectedCompany(null);
      setRejectionReason("");
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "거부 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePerplexityPrompt = async () => {
    if (!editingPerplexityPrompt.prompt_title || !editingPerplexityPrompt.system_prompt || !editingPerplexityPrompt.user_prompt_template) {
      toast({
        title: "필수 정보 누락",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (editingPerplexityPrompt.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('gpt_prompts')
          .update({
            prompt_title: editingPerplexityPrompt.prompt_title,
            system_prompt: editingPerplexityPrompt.system_prompt,
            user_prompt_template: editingPerplexityPrompt.user_prompt_template,
            is_active: editingPerplexityPrompt.is_active
          })
          .eq('id', editingPerplexityPrompt.id);

        if (error) throw error;
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('gpt_prompts')
          .insert({
            prompt_type: editingPerplexityPrompt.prompt_type,
            prompt_title: editingPerplexityPrompt.prompt_title,
            system_prompt: editingPerplexityPrompt.system_prompt,
            user_prompt_template: editingPerplexityPrompt.user_prompt_template,
            is_active: true
          });

        if (error) throw error;
      }

      toast({
        title: "저장 완료",
        description: "퍼플렉시티 프롬프트가 성공적으로 저장되었습니다.",
      });

      setShowPerplexityPromptDialog(false);
      setEditingPerplexityPrompt({});
      fetchPerplexityPrompts();
    } catch (error: any) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt.prompt_title || !editingPrompt.system_prompt || !editingPrompt.user_prompt_template) {
      toast({
        title: "필수 정보 누락",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (editingPrompt.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('gpt_prompts')
          .update({
            prompt_title: editingPrompt.prompt_title,
            system_prompt: editingPrompt.system_prompt,
            user_prompt_template: editingPrompt.user_prompt_template,
            is_active: editingPrompt.is_active
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('gpt_prompts')
          .insert({
            prompt_type: editingPrompt.prompt_type,
            prompt_title: editingPrompt.prompt_title,
            system_prompt: editingPrompt.system_prompt,
            user_prompt_template: editingPrompt.user_prompt_template,
            is_active: true
          });

        if (error) throw error;
      }

      toast({
        title: "저장 완료",
        description: "프롬프트가 성공적으로 저장되었습니다.",
      });

      setShowPromptDialog(false);
      setEditingPrompt({});
      fetchPrompts();
    } catch (error: any) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        title: "파일 형식 오류",
        description: "Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadMarketData = async () => {
    if (!selectedFile) {
      toast({
        title: "파일 선택 필요",
        description: "업로드할 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // For demo purposes, we'll create a sample data entry
      // In production, you'd parse the Excel/CSV file here
      const sampleData = {
        market_size: "100억 달러",
        growth_rate: "15%",
        key_players: ["Company A", "Company B", "Company C"],
        regulations: "규제 정보",
        opportunities: "시장 기회 정보"
      };

      setUploadProgress(50);

      const { error } = await supabase
        .from('market_data')
        .insert({
          data_category: 'market_analysis',
          country: '미국',
          industry: 'IT',
          data_content: sampleData,
          source_file: selectedFile.name
        });

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "업로드 완료",
        description: "시장 데이터가 성공적으로 업로드되었습니다.",
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('market-data-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchMarketData();
    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddDataEntry = async () => {
    if (!newDataEntry.data_category || !newDataEntry.data_content) {
      toast({
        title: "필수 정보 누락",
        description: "카테고리와 데이터 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      let dataContent;
      try {
        dataContent = JSON.parse(newDataEntry.data_content);
      } catch {
        // If not valid JSON, store as simple object
        dataContent = { content: newDataEntry.data_content };
      }

      const { error } = await supabase
        .from('market_data')
        .insert({
          data_category: newDataEntry.data_category,
          country: newDataEntry.country || null,
          industry: newDataEntry.industry || null,
          data_content: dataContent
        });

      if (error) throw error;

      toast({
        title: "추가 완료",
        description: "데이터가 성공적으로 추가되었습니다.",
      });

      setNewDataEntry({
        data_category: '',
        country: '',
        industry: '',
        data_content: '',
      });
      setShowDataDialog(false);
      fetchMarketData();
    } catch (error: any) {
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pendingCompanies = companies.filter(c => c.is_approved === false && !c.rejection_reason);
  const approvedCompanies = companies.filter(c => c.is_approved === true);
  const rejectedCompanies = companies.filter(c => c.rejection_reason);

  const CompanyCard = ({ company, showActions = false }: { company: Company; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.company_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {company.ceo_name} 대표
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {company.headquarters_country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(company.created_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {company.is_approved ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                승인완료
              </Badge>
            ) : company.rejection_reason ? (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                거부됨
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                승인대기
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>업종:</strong> {company.industry}</p>
            <p><strong>담당자:</strong> {company.manager_name} ({company.manager_position})</p>
            <p><strong>연락처:</strong> {company.phone_number}</p>
            <p><strong>이메일:</strong> {company.email}</p>
          </div>
          <div>
            <p><strong>설립연도:</strong> {company.founding_year || '미입력'}</p>
            <p><strong>직원 수:</strong> {company.employee_count || '미입력'}</p>
            {company.website && (
              <p className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  웹사이트
                </a>
              </p>
            )}
          </div>
        </div>
        
        {company.main_products && (
          <div className="mt-4">
            <p><strong>주요 제품/서비스:</strong></p>
            <p className="text-gray-600 mt-1">{company.main_products}</p>
          </div>
        )}
        
        {company.target_market && (
          <div className="mt-4">
            <p><strong>타겟 시장:</strong></p>
            <p className="text-gray-600 mt-1">{company.target_market}</p>
          </div>
        )}

        {company.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p><strong>거부 사유:</strong></p>
            <p className="text-red-700 mt-1">{company.rejection_reason}</p>
          </div>
        )}
        
        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => handleApprove(company)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              승인
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setSelectedCompany(company);
                setShowRejectDialog(true);
              }}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              거부
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">기업 승인 관리 및 AI 시스템 설정</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-orange-600">{pendingCompanies.length}</CardTitle>
            <CardDescription>승인 대기</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">{approvedCompanies.length}</CardTitle>
            <CardDescription>승인 완료</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">{rejectedCompanies.length}</CardTitle>
            <CardDescription>거부됨</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">승인 대기 ({pendingCompanies.length})</TabsTrigger>
          <TabsTrigger value="approved">승인 완료 ({approvedCompanies.length})</TabsTrigger>
          <TabsTrigger value="rejected">거부됨 ({rejectedCompanies.length})</TabsTrigger>
          <TabsTrigger value="prompts">AI 프롬프트</TabsTrigger>
          <TabsTrigger value="perplexity">퍼플렉시티</TabsTrigger>
          <TabsTrigger value="data">시장 데이터</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingCompanies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">승인 대기 중인 기업이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            pendingCompanies.map(company => (
              <CompanyCard key={company.id} company={company} showActions={true} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {approvedCompanies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">승인된 기업이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            approvedCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          {rejectedCompanies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">거부된 기업이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))
          )}
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="prompts" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">AI 프롬프트 관리</h3>
              <p className="text-gray-600">GPT 분석에 사용되는 프롬프트를 관리합니다.</p>
            </div>
            <Button 
              onClick={() => {
                setEditingPrompt({ prompt_type: 'custom' });
                setShowPromptDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              새 프롬프트 추가
            </Button>
          </div>

          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {prompt.prompt_title}
                      </CardTitle>
                      <CardDescription>
                        타입: {prompt.prompt_type} | 최종 수정: {new Date(prompt.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prompt.is_active ? "default" : "secondary"}>
                        {prompt.is_active ? "활성" : "비활성"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPrompt(prompt);
                          setShowPromptDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">시스템 프롬프트:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {prompt.system_prompt.substring(0, 200)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">사용자 프롬프트 템플릿:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {prompt.user_prompt_template.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Perplexity Prompts Tab */}
        <TabsContent value="perplexity" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">퍼플렉시티 프롬프트 관리</h3>
              <p className="text-gray-600">Perplexity 분석에 사용되는 프롬프트를 관리합니다.</p>
            </div>
            <Button 
              onClick={() => {
                setEditingPerplexityPrompt({ prompt_type: 'perplexity_custom' });
                setShowPerplexityPromptDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              새 프롬프트 추가
            </Button>
          </div>

          <div className="space-y-4">
            {perplexityPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {prompt.prompt_title}
                      </CardTitle>
                      <CardDescription>
                        타입: {prompt.prompt_type} | 최종 수정: {new Date(prompt.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prompt.is_active ? "default" : "secondary"}>
                        {prompt.is_active ? "활성" : "비활성"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPerplexityPrompt(prompt);
                          setShowPerplexityPromptDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">시스템 프롬프트:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {prompt.system_prompt.substring(0, 200)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">사용자 프롬프트 템플릿:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {prompt.user_prompt_template.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="data" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">시장 데이터 관리</h3>
              <p className="text-gray-600">AI 분석에 참조되는 시장 데이터를 관리합니다.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowDataDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                데이터 직접 추가
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Excel 파일 업로드
              </CardTitle>
              <CardDescription>
                Excel 또는 CSV 파일로 시장 데이터를 일괄 업로드합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="market-data-file">파일 선택</Label>
                <Input
                  id="market-data-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileSpreadsheet className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>업로드 중...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleUploadMarketData} 
                disabled={!selectedFile || uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "업로드 중..." : "업로드"}
              </Button>
            </CardContent>
          </Card>

          {/* Market Data List */}
          <div className="space-y-4">
            {marketData.map((data) => (
              <Card key={data.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        {data.data_category}
                      </CardTitle>
                      <CardDescription>
                        {data.country && `국가: ${data.country}`}
                        {data.industry && ` | 업종: ${data.industry}`}
                        {data.source_file && ` | 파일: ${data.source_file}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={data.is_active ? "default" : "secondary"}>
                        {data.is_active ? "활성" : "비활성"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(data.data_content, null, 2).substring(0, 300)}...
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기업 승인 거부</DialogTitle>
            <DialogDescription>
              {selectedCompany?.company_name}의 회원가입을 거부하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">거부 사유 *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="거부 사유를 입력해주세요..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              <Mail className="h-4 w-4 mr-2" />
              거부 및 이메일 발송
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prompt Edit Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI 프롬프트 편집</DialogTitle>
            <DialogDescription>
              GPT 분석에 사용될 프롬프트를 편집합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prompt-title">프롬프트 제목 *</Label>
                <Input
                  id="prompt-title"
                  value={editingPrompt.prompt_title || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_title: e.target.value })}
                  placeholder="프롬프트 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="prompt-type">프롬프트 타입 *</Label>
                <Select 
                  value={editingPrompt.prompt_type || ''} 
                  onValueChange={(value) => setEditingPrompt({ ...editingPrompt, prompt_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_analysis">기업 분석</SelectItem>
                    <SelectItem value="market_research">시장 조사</SelectItem>
                    <SelectItem value="final_report">최종 리포트</SelectItem>
                    <SelectItem value="custom">커스텀</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="system-prompt">시스템 프롬프트 *</Label>
              <Textarea
                id="system-prompt"
                value={editingPrompt.system_prompt || ''}
                onChange={(e) => setEditingPrompt({ ...editingPrompt, system_prompt: e.target.value })}
                placeholder="시스템 프롬프트를 입력하세요..."
                className="h-32"
              />
            </div>
            <div>
              <Label htmlFor="user-prompt">사용자 프롬프트 템플릿 *</Label>
              <Textarea
                id="user-prompt"
                value={editingPrompt.user_prompt_template || ''}
                onChange={(e) => setEditingPrompt({ ...editingPrompt, user_prompt_template: e.target.value })}
                placeholder="사용자 프롬프트 템플릿을 입력하세요... (변수: {company_name}, {target_countries} 등)"
                className="h-48"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromptDialog(false)}>
              취소
            </Button>
            <Button onClick={handleSavePrompt} disabled={actionLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Perplexity Prompt Edit Dialog */}
      <Dialog open={showPerplexityPromptDialog} onOpenChange={setShowPerplexityPromptDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>퍼플렉시티 프롬프트 편집</DialogTitle>
            <DialogDescription>
              Perplexity 분석에 사용될 프롬프트를 편집합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perplexity-prompt-title">프롬프트 제목 *</Label>
                <Input
                  id="perplexity-prompt-title"
                  value={editingPerplexityPrompt.prompt_title || ''}
                  onChange={(e) => setEditingPerplexityPrompt({ ...editingPerplexityPrompt, prompt_title: e.target.value })}
                  placeholder="프롬프트 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="perplexity-prompt-type">프롬프트 타입 *</Label>
                <Select 
                  value={editingPerplexityPrompt.prompt_type || ''} 
                  onValueChange={(value) => setEditingPerplexityPrompt({ ...editingPerplexityPrompt, prompt_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perplexity_market_research">퍼플렉시티 시장 조사</SelectItem>
                    <SelectItem value="perplexity_trend_analysis">퍼플렉시티 트렌드 분석</SelectItem>
                    <SelectItem value="perplexity_competitor_analysis">퍼플렉시티 경쟁사 분석</SelectItem>
                    <SelectItem value="perplexity_custom">퍼플렉시티 커스텀</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="perplexity-system-prompt">시스템 프롬프트 *</Label>
              <Textarea
                id="perplexity-system-prompt"
                value={editingPerplexityPrompt.system_prompt || ''}
                onChange={(e) => setEditingPerplexityPrompt({ ...editingPerplexityPrompt, system_prompt: e.target.value })}
                placeholder="퍼플렉시티용 시스템 프롬프트를 입력하세요..."
                className="h-32"
              />
            </div>
            <div>
              <Label htmlFor="perplexity-user-prompt">사용자 프롬프트 템플릿 *</Label>
              <Textarea
                id="perplexity-user-prompt"
                value={editingPerplexityPrompt.user_prompt_template || ''}
                onChange={(e) => setEditingPerplexityPrompt({ ...editingPerplexityPrompt, user_prompt_template: e.target.value })}
                placeholder="퍼플렉시티용 사용자 프롬프트 템플릿을 입력하세요... (변수: {company_name}, {target_countries} 등)"
                className="h-48"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPerplexityPromptDialog(false)}>
              취소
            </Button>
            <Button onClick={handleSavePerplexityPrompt} disabled={actionLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Entry Dialog */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>시장 데이터 직접 추가</DialogTitle>
            <DialogDescription>
              시장 데이터를 직접 입력하여 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="data-category">데이터 카테고리 *</Label>
                <Select 
                  value={newDataEntry.data_category} 
                  onValueChange={(value) => setNewDataEntry({ ...newDataEntry, data_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market_analysis">시장 분석</SelectItem>
                    <SelectItem value="regulations">규제 정보</SelectItem>
                    <SelectItem value="partners">파트너 정보</SelectItem>
                    <SelectItem value="competitors">경쟁사 정보</SelectItem>
                    <SelectItem value="trends">트렌드 정보</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data-country">국가 (선택)</Label>
                <Input
                  id="data-country"
                  value={newDataEntry.country}
                  onChange={(e) => setNewDataEntry({ ...newDataEntry, country: e.target.value })}
                  placeholder="예: 미국"
                />
              </div>
              <div>
                <Label htmlFor="data-industry">업종 (선택)</Label>
                <Input
                  id="data-industry"
                  value={newDataEntry.industry}
                  onChange={(e) => setNewDataEntry({ ...newDataEntry, industry: e.target.value })}
                  placeholder="예: IT"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="data-content">데이터 내용 *</Label>
              <Textarea
                id="data-content"
                value={newDataEntry.data_content}
                onChange={(e) => setNewDataEntry({ ...newDataEntry, data_content: e.target.value })}
                placeholder='JSON 형식 또는 일반 텍스트로 입력하세요. 예: {"market_size": "100억 달러", "growth_rate": "15%"}'
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddDataEntry}>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}