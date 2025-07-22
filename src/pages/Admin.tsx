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
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<GPTPrompt | null>(null);
  const [selectedPerplexityPrompt, setSelectedPerplexityPrompt] = useState<PerplexityPrompt | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showPerplexityPromptDialog, setShowPerplexityPromptDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminComments, setAdminComments] = useState("");
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
      fetchMarketData(),
      fetchMatchingRequests()
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

  const fetchMatchingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('matching_requests')
        .select(`
          *,
          companies!matching_requests_company_id_fkey (
            company_name,
            email,
            industry,
            headquarters_country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatchingRequests(data || []);
    } catch (error: any) {
      toast({
        title: "매칭 요청 로드 오류",
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

  const handleFinalizeReport = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      // Update matching request with admin comments
      const { error: updateError } = await supabase
        .from('matching_requests')
        .update({
          admin_comments: adminComments,
          status: 'published'
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Send final report email to company
      const { error: emailError } = await supabase.functions.invoke('send-analysis-complete-email', {
        body: {
          companyId: selectedRequest.company_id,
          matchingRequestId: selectedRequest.id,
          reportSummary: selectedRequest.final_report?.summary || '리포트가 준비되었습니다.'
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "배포 완료",
          description: "리포트 배포는 완료되었으나 이메일 발송에 실패했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "배포 완료",
          description: "리포트가 성공적으로 배포되었고 기업에 알림 이메일이 발송되었습니다.",
        });
      }

      setShowReportDialog(false);
      setSelectedRequest(null);
      setAdminComments('');
      fetchMatchingRequests();
    } catch (error: any) {
      toast({
        title: "배포 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to render analysis content in a structured way
  const renderAnalysisContent = (data: any) => {
    if (typeof data === 'string') {
      return <div className="prose prose-sm max-w-none">{data}</div>;
    }

    if (typeof data === 'object' && data !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-l-4 border-blue-200 pl-4">
              <h5 className="font-medium text-gray-900 mb-2 capitalize">
                {key.replace(/[_-]/g, ' ')}
              </h5>
              {Array.isArray(value) ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {value.map((item, index) => (
                    <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey}>
                      <span className="font-medium text-gray-800">
                        {subKey.replace(/[_-]/g, ' ')}:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {Array.isArray(subValue) 
                          ? subValue.join(', ') 
                          : typeof subValue === 'object' 
                            ? JSON.stringify(subValue)
                            : String(subValue)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{String(value)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-gray-500">데이터가 없습니다.</div>;
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pending">승인 대기 ({pendingCompanies.length})</TabsTrigger>
          <TabsTrigger value="approved">승인 완료 ({approvedCompanies.length})</TabsTrigger>
          <TabsTrigger value="rejected">거부됨 ({rejectedCompanies.length})</TabsTrigger>
          <TabsTrigger value="reports">리포트 리뷰</TabsTrigger>
          <TabsTrigger value="history">배포 히스토리</TabsTrigger>
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

        {/* Report Review Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">리포트 리뷰 및 승인</h3>
              <p className="text-gray-600">완성된 분석 리포트를 검토하고 최종 승인합니다.</p>
            </div>
          </div>

          <div className="space-y-6">
            {matchingRequests
              .filter(request => request.status === 'completed' && request.ai_analysis && request.market_research)
              .map((request) => (
                <Card key={request.id} className="border-2 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Building2 className="h-6 w-6 text-blue-600" />
                          {request.companies?.company_name || 'Unknown Company'}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          📍 {request.companies?.industry} | {request.companies?.headquarters_country} | 
                          ✅ 분석 완료: {new Date(request.completed_at || request.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={request.is_published ? "default" : "outline"}
                          className="text-sm px-3 py-1"
                        >
                          {request.is_published ? "🟢 발행됨" : "🟡 검토 중"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminComments(request.admin_comments || '');
                            setShowReportDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          상세 리뷰
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Executive Summary */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-lg mb-3 text-yellow-900 flex items-center gap-2">
                        ⭐ 종합 분석 요약
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {request.ai_analysis?.투자_파트너십_권고 && (
                          <div className="bg-white p-3 rounded border">
                            <p className="font-semibold text-green-700">투자 등급</p>
                            <p className="text-xl font-bold text-green-800">
                              {(request.ai_analysis.투자_파트너십_권고 as any)?.투자_등급 || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              성공확률: {(request.ai_analysis.투자_파트너십_권고 as any)?.성공_확률 || 'N/A'}
                            </p>
                          </div>
                        )}
                        
                        {request.ai_analysis?.재무_현황_투자가치?.밸류에이션 && (
                          <div className="bg-white p-3 rounded border">
                            <p className="font-semibold text-blue-700">기업 가치</p>
                            <p className="text-lg font-bold text-blue-800">
                              {request.ai_analysis.재무_현황_투자가치.밸류에이션}
                            </p>
                          </div>
                        )}
                        
                        {request.market_research?.최종_시장_진출_권고?.ROI_예측 && (
                          <div className="bg-white p-3 rounded border">
                            <p className="font-semibold text-purple-700">ROI 예측</p>
                            <p className="text-sm font-bold text-purple-800">
                              {request.market_research.최종_시장_진출_권고.ROI_예측}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Company Analysis Section */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2 border-b-2 border-blue-200 pb-2">
                          🏢 기업 분석 리포트
                        </h4>
                        
                        {request.ai_analysis && typeof request.ai_analysis === 'object' ? (
                          <div className="space-y-4">
                            {/* Company Overview */}
                            {request.ai_analysis.회사_개요?.기본_정보 && (
                              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <h5 className="font-semibold text-blue-900 mb-2">1. 회사 개요</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">기업명:</span>
                                    <span>{request.ai_analysis.회사_개요.기본_정보.기업명}</span>
                                    <span className="font-medium">설립연도:</span>
                                    <span>{request.ai_analysis.회사_개요.기본_정보.설립연도}</span>
                                    <span className="font-medium">사업영역:</span>
                                    <span>{request.ai_analysis.회사_개요.기본_정보.사업_영역}</span>
                                  </div>
                                  <div className="mt-2 p-2 bg-green-100 rounded">
                                    <span className="font-medium text-green-800">성공 가능성:</span>
                                    <span className="text-green-700 ml-2">{request.ai_analysis.회사_개요.기본_정보.성공_가능성}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Business Model */}
                            {request.ai_analysis.사업_모델_심층분석 && (
                              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                <h5 className="font-semibold text-green-900 mb-2">2. 사업 모델 분석</h5>
                                <div className="space-y-2 text-sm">
                                  {request.ai_analysis.사업_모델_심층분석.핵심_가치_제안 && (
                                    <div>
                                      <span className="font-medium">문제 해결 수준:</span>
                                      <span className="ml-2">{request.ai_analysis.사업_모델_심층분석.핵심_가치_제안.문제_해결_수준}</span>
                                    </div>
                                  )}
                                  {request.ai_analysis.사업_모델_심층분석.수익_구조_분석 && (
                                    <div className="mt-2">
                                      <span className="font-medium">수익 구조:</span>
                                      <div className="ml-4 mt-1 text-xs space-y-1">
                                        <div>SaaS: {request.ai_analysis.사업_모델_심층분석.수익_구조_분석.SaaS_구독}</div>
                                        <div>커스터마이징: {request.ai_analysis.사업_모델_심층분석.수익_구조_분석.커스터마이징}</div>
                                        <div>반복 수익 비중: {request.ai_analysis.사업_모델_심층분석.수익_구조_분석.반복_수익_비중}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Technology Innovation */}
                            {request.ai_analysis.기술_혁신_분석 && (
                              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                <h5 className="font-semibold text-purple-900 mb-2">3. 기술 및 혁신</h5>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">기술 경쟁력:</span>
                                    <span className="ml-2">{request.ai_analysis.기술_혁신_분석.기술_경쟁력}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">IP 포트폴리오:</span>
                                    <span className="ml-2 text-xs">{request.ai_analysis.기술_혁신_분석.IP_포트폴리오}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">R&D 투자:</span>
                                    <span className="ml-2">{request.ai_analysis.기술_혁신_분석.R_D_투자}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Financial Status */}
                            {request.ai_analysis.재무_현황_투자가치 && (
                              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                <h5 className="font-semibold text-orange-900 mb-2">4. 재무 현황</h5>
                                <div className="space-y-2 text-sm">
                                  {request.ai_analysis.재무_현황_투자가치.재무_건전성 && (
                                    <>
                                      <div>
                                        <span className="font-medium">매출 성장률:</span>
                                        <span className="ml-2">{request.ai_analysis.재무_현황_투자가치.재무_건전성.매출_성장률}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">수익성:</span>
                                        <span className="ml-2 text-xs">{request.ai_analysis.재무_현황_투자가치.재무_건전성.수익성}</span>
                                      </div>
                                    </>
                                  )}
                                  <div className="mt-2 p-2 bg-orange-100 rounded">
                                    <span className="font-medium">밸류에이션:</span>
                                    <span className="ml-2 font-bold">{request.ai_analysis.재무_현황_투자가치.밸류에이션}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded border text-center text-gray-600">
                            기업 분석 데이터를 불러올 수 없습니다
                          </div>
                        )}
                      </div>

                      {/* Market Research Section */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2 border-b-2 border-green-200 pb-2">
                          📊 시장 분석 리포트
                        </h4>
                        
                        {request.market_research && typeof request.market_research === 'object' ? (
                          <div className="space-y-4">
                            {/* Market Overview */}
                            {request.market_research.시장_개관_규모분석 && (
                              <div className="border border-teal-200 rounded-lg p-4 bg-teal-50">
                                <h5 className="font-semibold text-teal-900 mb-2">1. 시장 개관</h5>
                                <div className="space-y-2 text-sm">
                                  {request.market_research.시장_개관_규모분석.시장_규모 && (
                                    <>
                                      <div>
                                        <span className="font-medium">글로벌 AI 시장:</span>
                                        <span className="ml-2">{request.market_research.시장_개관_규모분석.시장_규모.글로벌_AI_시장}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">연평균 성장률:</span>
                                        <span className="ml-2 font-bold text-green-600">{request.market_research.시장_개관_규모분석.시장_규모.CAGR}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">아시아 태평양:</span>
                                        <span className="ml-2">{request.market_research.시장_개관_규모분석.시장_규모.아시아_태평양}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Competitive Landscape */}
                            {request.market_research.경쟁_환경_심층분석 && (
                              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <h5 className="font-semibold text-red-900 mb-2">2. 경쟁 환경</h5>
                                <div className="space-y-2 text-sm">
                                  {request.market_research.경쟁_환경_심층분석.주요_플레이어 && (
                                    <div>
                                      <span className="font-medium">주요 플레이어:</span>
                                      <div className="ml-4 mt-1 space-y-1 text-xs">
                                         {Object.entries((request.market_research.경쟁_환경_심층분석 as any)?.주요_플레이어 || {}).map(([company, details]) => (
                                           <div key={company} className="flex justify-between">
                                             <span className="font-medium">{company}:</span>
                                             <span>{String(details)}</span>
                                           </div>
                                         ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-2 p-2 bg-red-100 rounded">
                                    <span className="font-medium">경쟁 강도:</span>
                                    <span className="ml-2">{request.market_research.경쟁_환경_심층분석.경쟁_강도}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Market Opportunities */}
                            {request.market_research.시장_기회_성장동력 && (
                              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                                <h5 className="font-semibold text-indigo-900 mb-2">3. 시장 기회</h5>
                                <div className="space-y-2 text-sm">
                                  {request.market_research.시장_기회_성장동력.신규_기회 && (
                                    <div>
                                      <span className="font-medium">신규 기회:</span>
                                      <div className="ml-4 mt-1 space-y-1 text-xs">
                                         {Object.entries((request.market_research.시장_기회_성장동력 as any)?.신규_기회 || {}).map(([opportunity, value]) => (
                                           <div key={opportunity}>• {opportunity}: {String(value)}</div>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )}

                             {/* Market Entry Recommendation */}
                             {request.market_research.최종_시장_진출_권고 && (
                               <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                                 <h5 className="font-semibold text-emerald-900 mb-2">4. 시장 진출 권고</h5>
                                 <div className="space-y-2 text-sm">
                                   {(request.market_research.최종_시장_진출_권고 as any)?.시장_매력도 && (
                                     <div>
                                       <span className="font-medium">시장 매력도:</span>
                                       <div className="ml-4 mt-1 space-y-1 text-xs">
                                         {Object.entries((request.market_research.최종_시장_진출_권고 as any)?.시장_매력도 || {}).map(([country, score]) => (
                                           <div key={country} className="flex justify-between items-center">
                                             <span>{country}:</span>
                                             <Badge variant="outline" className="text-xs">{String(score)}</Badge>
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                   {(request.market_research.최종_시장_진출_권고 as any)?.성공_확률 && (
                                     <div className="mt-2">
                                       <span className="font-medium">성공 확률:</span>
                                       <div className="ml-4 mt-1 space-y-1 text-xs">
                                         {Object.entries((request.market_research.최종_시장_진출_권고 as any)?.성공_확률 || {}).map(([country, prob]) => (
                                           <div key={country} className="flex justify-between">
                                             <span>{country}:</span>
                                             <span className="font-bold text-green-600">{String(prob)}</span>
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                  <div className="mt-3 p-2 bg-emerald-100 rounded">
                                    <span className="font-medium">ROI 예측:</span>
                                    <span className="ml-2 font-bold">{request.market_research.최종_시장_진출_권고.ROI_예측}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded border text-center text-gray-600">
                            시장 분석 데이터를 불러올 수 없습니다
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Comments */}
                    {request.admin_comments && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          💬 관리자 코멘트
                        </h5>
                        <p className="text-sm text-yellow-800">{request.admin_comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {matchingRequests.filter(request => 
            request.status === 'completed' && request.ai_analysis && request.market_research
          ).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">검토할 리포트가 없습니다</h4>
                <p className="text-gray-500">완성된 분석 리포트가 생성되면 여기에 표시됩니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">📋 배포된 리포트 히스토리</h3>
              <p className="text-gray-600">배포 완료된 AI 분석 리포트들을 관리하고 수정할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {matchingRequests.filter(request => request.is_published).length}개 배포됨
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {matchingRequests
              .filter(request => request.is_published && request.ai_analysis && request.market_research)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((request) => (
                <Card key={request.id} className="border-2 border-green-200 shadow-sm bg-green-50">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Badge className="bg-green-600 text-white">PUBLISHED</Badge>
                          <Building2 className="h-5 w-5 text-green-700" />
                          {request.companies?.company_name || 'Unknown Company'}
                        </CardTitle>
                        <CardDescription className="text-base mt-2 text-green-800">
                          📍 {request.companies?.industry} | {request.companies?.headquarters_country} | 
                          📤 배포일: {request.published_at ? new Date(request.published_at).toLocaleDateString() : new Date(request.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 hover:bg-green-200"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminComments(request.admin_comments || '');
                            setShowReportDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 hover:bg-blue-100"
                          onClick={async () => {
                            // 재배포 로직
                            try {
                              const { error: emailError } = await supabase.functions.invoke('send-analysis-complete-email', {
                                body: {
                                  companyId: request.company_id,
                                  matchingRequestId: request.id,
                                  reportSummary: '리포트가 재전송되었습니다.'
                                }
                              });

                              if (emailError) {
                                toast({
                                  title: "재배포 실패",
                                  description: "이메일 발송에 실패했습니다.",
                                  variant: "destructive",
                                });
                              } else {
                                toast({
                                  title: "재배포 완료",
                                  description: "리포트가 성공적으로 재배포되었습니다.",
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: "재배포 실패",
                                description: error.message,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          재배포
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Executive Summary */}
                    <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-bold text-lg mb-3 text-green-900 flex items-center gap-2">
                        ⭐ 리포트 요약
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {request.ai_analysis?.투자_파트너십_권고 && (
                          <div className="bg-green-50 p-3 rounded border">
                            <p className="font-semibold text-green-700">투자 등급</p>
                            <p className="text-lg font-bold text-green-800">
                              {(request.ai_analysis as any).투자_파트너십_권고?.투자_등급 || 'N/A'}
                            </p>
                          </div>
                        )}
                        
                        {request.ai_analysis?.재무_현황_투자가치?.밸류에이션 && (
                          <div className="bg-blue-50 p-3 rounded border">
                            <p className="font-semibold text-blue-700">기업 가치</p>
                            <p className="text-sm font-bold text-blue-800">
                              {(request.ai_analysis as any).재무_현황_투자가치?.밸류에이션}
                            </p>
                          </div>
                        )}
                        
                        {request.market_research?.최종_시장_진출_권고?.ROI_예측 && (
                          <div className="bg-purple-50 p-3 rounded border">
                            <p className="font-semibold text-purple-700">ROI 예측</p>
                            <p className="text-sm font-bold text-purple-800">
                              {(request.market_research as any).최종_시장_진출_권고?.ROI_예측}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-600">타겟 시장</p>
                        <p className="font-semibold">{request.target_countries?.join(', ')}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-600">분석 완료</p>
                        <p className="font-semibold">{new Date(request.completed_at || request.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-600">배포 상태</p>
                        <Badge className="bg-green-600 text-white">배포됨</Badge>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-600">최종 수정</p>
                        <p className="font-semibold">{new Date(request.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Admin Comments History */}
                    {request.admin_comments && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          💬 관리자 코멘트
                        </h5>
                        <p className="text-sm text-yellow-800">{request.admin_comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {matchingRequests.filter(request => request.is_published).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">배포된 리포트가 없습니다</h4>
                <p className="text-gray-500">리포트 리뷰 탭에서 분석을 완료하고 배포하면 여기에 표시됩니다.</p>
              </CardContent>
            </Card>
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

          {/* Current Active Prompts Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              🟢 현재 활성화된 프롬프트
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {prompts.filter(prompt => prompt.is_active).map((prompt) => (
                <Card key={prompt.id} className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                          <Badge className="bg-green-600 text-white">ACTIVE</Badge>
                          {prompt.prompt_title}
                        </CardTitle>
                        <CardDescription className="text-green-700">
                          타입: <span className="font-semibold">{prompt.prompt_type}</span> | 
                          수정: {new Date(prompt.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-300 hover:bg-green-100"
                        onClick={() => {
                          setEditingPrompt(prompt);
                          setShowPromptDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">시스템 프롬프트:</p>
                        <div className="text-xs text-green-700 bg-white p-3 rounded border border-green-200 mt-1 max-h-20 overflow-y-auto">
                          {prompt.system_prompt.substring(0, 150)}...
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">사용자 프롬프트 템플릿:</p>
                        <div className="text-xs text-green-700 bg-white p-3 rounded border border-green-200 mt-1 max-h-20 overflow-y-auto">
                          {prompt.user_prompt_template.substring(0, 150)}...
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {prompts.filter(prompt => prompt.is_active).length === 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="text-center py-6">
                  <div className="text-orange-600">
                    <Settings className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">활성화된 프롬프트가 없습니다</p>
                    <p className="text-sm">최소 하나의 프롬프트를 활성화하여 AI 분석을 진행하세요.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* All Prompts Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              전체 프롬프트 목록
            </h4>
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className={prompt.is_active ? "opacity-75" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          {prompt.prompt_title}
                          {prompt.is_active && <Badge className="bg-green-600 text-white text-xs">사용중</Badge>}
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

          {/* Current Active Perplexity Prompts Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              🟣 현재 활성화된 퍼플렉시티 프롬프트
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {perplexityPrompts.filter(prompt => prompt.is_active).map((prompt) => (
                <Card key={prompt.id} className="border-2 border-purple-200 bg-purple-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                          <Badge className="bg-purple-600 text-white">ACTIVE</Badge>
                          {prompt.prompt_title}
                        </CardTitle>
                        <CardDescription className="text-purple-700">
                          타입: <span className="font-semibold">{prompt.prompt_type}</span> | 
                          수정: {new Date(prompt.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-300 hover:bg-purple-100"
                        onClick={() => {
                          setEditingPerplexityPrompt(prompt);
                          setShowPerplexityPromptDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-purple-800">시스템 프롬프트:</p>
                        <div className="text-xs text-purple-700 bg-white p-3 rounded border border-purple-200 mt-1 max-h-20 overflow-y-auto">
                          {prompt.system_prompt.substring(0, 150)}...
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">사용자 프롬프트 템플릿:</p>
                        <div className="text-xs text-purple-700 bg-white p-3 rounded border border-purple-200 mt-1 max-h-20 overflow-y-auto">
                          {prompt.user_prompt_template.substring(0, 150)}...
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {perplexityPrompts.filter(prompt => prompt.is_active).length === 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="text-center py-6">
                  <div className="text-orange-600">
                    <Settings className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">활성화된 퍼플렉시티 프롬프트가 없습니다</p>
                    <p className="text-sm">최소 하나의 프롬프트를 활성화하여 시장 분석을 진행하세요.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* All Perplexity Prompts Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              전체 퍼플렉시티 프롬프트 목록
            </h4>
            <div className="space-y-4">
              {perplexityPrompts.map((prompt) => (
                <Card key={prompt.id} className={prompt.is_active ? "opacity-75" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          {prompt.prompt_title}
                          {prompt.is_active && <Badge className="bg-purple-600 text-white text-xs">사용중</Badge>}
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

      {/* Report Review Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">📊 AI 분석 리포트 상세 검토</DialogTitle>
            <DialogDescription className="text-lg">
              완성된 AI 분석 결과를 검토하고 최종 배포를 진행합니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="flex-1 overflow-hidden">
              {/* Company Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedRequest.companies?.company_name}</h2>
                    <div className="flex items-center gap-6 text-blue-100">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedRequest.companies?.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedRequest.companies?.headquarters_country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        분석완료: {new Date(selectedRequest.completed_at || selectedRequest.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-white text-blue-600 text-sm px-4 py-2">
                      {selectedRequest.target_countries?.join(', ')} 진출
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] pr-2">
                {/* Company Analysis */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      🏢 기업 분석 리포트
                    </h3>
                    
                    {selectedRequest.ai_analysis && typeof selectedRequest.ai_analysis === 'object' ? (
                      <div className="space-y-4">
                        {/* Executive Summary */}
                        {(selectedRequest.ai_analysis as any)?.투자_파트너십_권고 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-green-800">💰 투자 등급</h4>
                              <span className="text-2xl font-bold text-green-600">
                                {(selectedRequest.ai_analysis as any).투자_파트너십_권고.투자_등급}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">성공 확률:</span>
                                <span className="ml-2 font-semibold text-green-700">
                                  {(selectedRequest.ai_analysis as any).투자_파트너십_권고.성공_확률}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">기대 수익률:</span>
                                <span className="ml-2 font-semibold text-green-700">
                                  {(selectedRequest.ai_analysis as any).투자_파트너십_권고.기대_수익률}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Company Overview */}
                        {(selectedRequest.ai_analysis as any)?.회사_개요?.기본_정보 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-blue-800 mb-3">🏭 회사 개요</h4>
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-600">설립연도:</span>
                                  <span className="ml-2 font-medium">{(selectedRequest.ai_analysis as any).회사_개요.기본_정보.설립연도}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">사업영역:</span>
                                  <span className="ml-2 font-medium text-xs">{(selectedRequest.ai_analysis as any).회사_개요.기본_정보.사업_영역}</span>
                                </div>
                              </div>
                              <div className="bg-green-50 p-2 rounded mt-2">
                                <span className="text-green-800 font-medium">성공 가능성:</span>
                                <span className="ml-2 text-green-700 font-bold">
                                  {(selectedRequest.ai_analysis as any).회사_개요.기본_정보.성공_가능성}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Financial Status */}
                        {(selectedRequest.ai_analysis as any)?.재무_현황_투자가치 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-orange-800 mb-3">💼 재무 현황</h4>
                            <div className="space-y-2 text-sm">
                              {(selectedRequest.ai_analysis as any).재무_현황_투자가치.재무_건전성 && (
                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <span className="text-gray-600">매출 성장률:</span>
                                    <span className="ml-2 font-bold text-green-600">
                                      {(selectedRequest.ai_analysis as any).재무_현황_투자가치.재무_건전성.매출_성장률}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">수익성:</span>
                                    <span className="ml-2 font-medium text-xs">
                                      {(selectedRequest.ai_analysis as any).재무_현황_투자가치.재무_건전성.수익성}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="bg-orange-50 p-2 rounded mt-2">
                                <span className="text-orange-800 font-medium">기업 가치:</span>
                                <span className="ml-2 text-orange-700 font-bold">
                                  {(selectedRequest.ai_analysis as any).재무_현황_투자가치.밸류에이션}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Technology */}
                        {(selectedRequest.ai_analysis as any)?.기술_혁신_분석 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-purple-800 mb-3">🔬 기술 혁신</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">기술 경쟁력:</span>
                                <span className="ml-2 font-bold text-purple-600">
                                  {(selectedRequest.ai_analysis as any).기술_혁신_분석.기술_경쟁력}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">R&D 투자:</span>
                                <span className="ml-2 font-medium text-purple-700">
                                  {(selectedRequest.ai_analysis as any).기술_혁신_분석.R_D_투자}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                        기업 분석 데이터를 불러올 수 없습니다
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Research */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      📈 시장 분석 리포트
                    </h3>
                    
                    {selectedRequest.market_research && typeof selectedRequest.market_research === 'object' ? (
                      <div className="space-y-4">
                        {/* Market Size */}
                        {(selectedRequest.market_research as any)?.시장_개관_규모분석?.시장_규모 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-teal-800 mb-3">🌍 시장 규모</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">글로벌 AI 시장:</span>
                                <span className="ml-2 font-bold text-teal-600">
                                  {(selectedRequest.market_research as any).시장_개관_규모분석.시장_규모.글로벌_AI_시장}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">연평균 성장률:</span>
                                <span className="ml-2 font-bold text-green-600">
                                  {(selectedRequest.market_research as any).시장_개관_규모분석.시장_규모.CAGR}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {(selectedRequest.market_research as any).시장_개관_규모분석.시장_규모.아시아_태평양}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Competition */}
                        {(selectedRequest.market_research as any)?.경쟁_환경_심층분석 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-red-800 mb-3">⚔️ 경쟁 환경</h4>
                            <div className="space-y-2 text-sm">
                              <div className="bg-red-50 p-2 rounded">
                                <span className="text-red-800 font-medium">경쟁 강도:</span>
                                <span className="ml-2 text-red-700 font-bold">
                                  {(selectedRequest.market_research as any).경쟁_환경_심층분석.경쟁_강도}
                                </span>
                              </div>
                              {(selectedRequest.market_research as any).경쟁_환경_심층분석.주요_플레이어 && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">주요 플레이어:</p>
                                  <div className="space-y-1 text-xs">
                                    {Object.entries((selectedRequest.market_research as any).경쟁_환경_심층분석.주요_플레이어).slice(0, 3).map(([company, details]) => (
                                      <div key={company} className="bg-gray-50 p-2 rounded flex justify-between">
                                        <span className="font-medium">{company}:</span>
                                        <span className="text-gray-600 text-xs">{String(details).substring(0, 40)}...</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Market Entry */}
                        {(selectedRequest.market_research as any)?.최종_시장_진출_권고 && (
                          <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold text-emerald-800 mb-3">🎯 진출 권고</h4>
                            <div className="space-y-3 text-sm">
                              <div className="bg-emerald-50 p-3 rounded">
                                <span className="text-emerald-800 font-medium">ROI 예측:</span>
                                <span className="ml-2 text-emerald-700 font-bold text-lg">
                                  {(selectedRequest.market_research as any).최종_시장_진출_권고.ROI_예측}
                                </span>
                              </div>
                              
                              {(selectedRequest.market_research as any).최종_시장_진출_권고.시장_매력도 && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">시장 매력도:</p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {Object.entries((selectedRequest.market_research as any).최종_시장_진출_권고.시장_매력도).map(([country, score]) => (
                                      <div key={country} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="font-medium">{country}</span>
                                        <Badge variant="outline" className="text-xs font-bold">
                                          {String(score)}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {(selectedRequest.market_research as any).최종_시장_진출_권고.성공_확률 && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">성공 확률:</p>
                                  <div className="space-y-1">
                                    {Object.entries((selectedRequest.market_research as any).최종_시장_진출_권고.성공_확률).map(([country, prob]) => (
                                      <div key={country} className="flex justify-between text-xs">
                                        <span>{country}:</span>
                                        <span className="font-bold text-green-600">{String(prob)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                        시장 분석 데이터를 불러올 수 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Comments */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Label htmlFor="admin-comments" className="text-lg font-semibold text-yellow-900 mb-2 block">
                  💬 관리자 최종 검토 의견
                </Label>
                <Textarea
                  id="admin-comments"
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="리포트 품질, 수정 필요사항, 추가 권고사항 등을 입력하세요..."
                  className="h-24 border-yellow-300 focus:border-yellow-500"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} className="px-6">
              취소
            </Button>
            <Button 
              onClick={handleFinalizeReport}
              disabled={actionLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
            >
              <Mail className="h-4 w-4 mr-2" />
              최종 승인 및 배포
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}