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
  FileSpreadsheet, Brain, Upload, Edit, Trash2, Save, Plus, Home, RefreshCw,
  Send, MessageSquare, FileEdit, Database, ArrowRight, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarketResearchDisplay } from "@/components/ui/market-research-display";

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
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [adminPrompts, setAdminPrompts] = useState<Record<number, string>>({});
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
  const [showRawDebug, setShowRawDebug] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<GPTPrompt>>({});
  const [editingPerplexityPrompt, setEditingPerplexityPrompt] = useState<Partial<PerplexityPrompt>>({});
  const [newDataEntry, setNewDataEntry] = useState({
    data_category: '',
    country: '',
    industry: '',
    data_content: '',
  });
  const [showPdfAnalysisDialog, setShowPdfAnalysisDialog] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfAnalysisLoading, setPdfAnalysisLoading] = useState(false);

  // Pretty renderer for AI JSON outputs (cards, tables, lists)
  const renderSmartValue = (value: any, accent: 'blue' | 'purple' = 'blue') => {
    const borderColor = accent === 'blue' ? 'border-blue-200' : 'border-purple-200';
    const titleColor = accent === 'blue' ? 'text-blue-800' : 'text-purple-800';
    const chipColor = accent === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700';

    if (value === null || value === undefined) return <span className="text-gray-500">-</span>;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            const parsed = JSON.parse(trimmed);
            return renderSmartValue(parsed, accent);
          } catch {
            // fallthrough to plain text
          }
        }
      }
      return <p className="whitespace-pre-wrap leading-relaxed">{String(value)}</p>;
    }
    if (Array.isArray(value)) {
      // Array of primitives
      if (value.length === 0) return <span className="text-gray-500">(없음)</span>;
      if (value.every(v => typeof v !== 'object' || v === null)) {
        return (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="ml-2">{String(item)}</li>
            ))}
          </ul>
        );
      }
      // Array of objects -> table
      const headers = Array.from(
        value.reduce<Set<string>>((set, row) => {
          if (row && typeof row === 'object' && !Array.isArray(row)) {
            Object.keys(row).forEach(k => set.add(k));
          }
          return set;
        }, new Set<string>())
      );
      return (
        <div className={`overflow-x-auto rounded border ${borderColor}`}>
          <table className="min-w-full text-sm">
            <thead className={accent === 'blue' ? 'bg-blue-50' : 'bg-purple-50'}>
              <tr>
                {headers.map(h => (
                  <th key={h} className={`px-3 py-2 text-left font-semibold ${titleColor}`}>{h.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((row, rIdx) => (
                <tr key={rIdx} className="odd:bg-white even:bg-gray-50">
                  {headers.map(h => (
                    <td key={h} className="px-3 py-2 align-top">
                      {renderSmartValue((row as any)?.[h], accent)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Object -> key-value cards
    return (
      <div className="grid gap-3">
        {Object.entries(value as Record<string, any>).map(([k, v]) => (
          <div key={k} className={`bg-white p-3 rounded border ${borderColor}`}>
            <div className={`text-xs inline-flex px-2 py-1 rounded ${chipColor} mb-2 font-medium`}>{k.replace(/_/g, ' ')}</div>
            <div>{renderSmartValue(v, accent)}</div>
          </div>
        ))}
      </div>
    );
  };

  // Hide noisy meta fields and sensitive info from AI outputs
  const sanitizeAiObject = (obj: any, type: 'gpt' | 'perplexity'): any => {
    if (!obj || typeof obj !== 'object') return obj;
    const hiddenKeys = new Set([
      'prompt_used', 'analysis_provider', 'provider', 'generated_at',
      'parsing_error', 'error_message', 'raw_content', 'status', 'error', 'error_type', 'status_code', 'status_text'
    ]);
    const clone: any = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
      if (hiddenKeys.has(k)) continue;
      clone[k] = typeof v === 'object' && v !== null ? sanitizeAiObject(v, type) : v;
    }
    return clone;
  };


  // Filter companies by status
  // is_approved가 false이거나 null인 경우를 승인 대기로 처리 (관리자 계정 제외)
  const pendingCompanies = companies.filter(c => (c.is_approved === false || c.is_approved === null) && !c.is_admin);
  const approvedCompanies = companies.filter(c => c.is_approved === true && !c.is_admin);
  const rejectedCompanies = companies.filter(c => c.is_approved === false && c.rejection_reason);
  
  console.log('Filtered results:');
  console.log('Pending companies:', pendingCompanies);
  console.log('Approved companies:', approvedCompanies);
  console.log('Rejected companies:', rejectedCompanies);

  // Filter completed requests for report review - now including those with AI analysis done but still pending admin review
  const completedRequests = matchingRequests.filter(request => 
    (request.status === 'completed' || request.workflow_status === 'admin_approved') && 
    (request.final_report || request.ai_analysis || request.market_research)
  );

  useEffect(() => {
    console.log('Admin page mounted, fetching all data...');
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCompanies(),
        fetchPrompts(),
        fetchPerplexityPrompts(),
        fetchMarketData(),
        fetchMatchingRequests()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched companies:', data);
      console.log('Companies with is_approved false:', data?.filter(c => c.is_approved === false));
      console.log('Companies with is_approved null:', data?.filter(c => c.is_approved === null));
      console.log('Admin companies:', data?.filter(c => c.is_admin === true));
      
      setCompanies(data || []);
    } catch (error: any) {
      toast({
        title: "기업 데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
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
      // 1) Fetch requests only (avoid ambiguous PostgREST embeds causing 400)
      const { data: requests, error } = await supabase
        .from('matching_requests')
        .select(`*, pdf_summary, ai_analysis, market_research, report_token`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2) Fetch companies separately and merge by company_id
      const companyIds = Array.from(new Set((requests || []).map(r => r.company_id).filter(Boolean)));
      let companyMap: Record<number, any> = {};
      if (companyIds.length > 0) {
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, company_name, email, industry, headquarters_country')
          .in('id', companyIds as number[]);
        for (const c of companiesData || []) {
          companyMap[c.id] = c;
        }
      }

      const merged = (requests || []).map(r => ({ ...r, company: companyMap[r.company_id] }));
      setMatchingRequests(merged);
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

  // Company Card Component
  const CompanyCard = ({ company, showActions = false }: { company: Company; showActions?: boolean }) => {
    return (
      <Card key={company.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.company_name}
              {company.is_approved === true && <Badge className="bg-green-100 text-green-800">승인됨</Badge>}
              {company.is_approved === false && company.rejection_reason && <Badge variant="destructive">거부됨</Badge>}
              {(company.is_approved === false || company.is_approved === null) && !company.rejection_reason && <Badge variant="secondary">승인 대기</Badge>}
            </CardTitle>
            <CardDescription>
              CEO: {company.ceo_name} | 담당자: {company.manager_name} ({company.manager_position})
            </CardDescription>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(company.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold mb-2">기업 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{company.headquarters_country}, {company.headquarters_city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{company.employee_count} 직원</span>
              </div>
              <div>
                <span className="font-medium">설립년도:</span> {company.founding_year}
              </div>
              <div>
                <span className="font-medium">매출 규모:</span> {company.revenue_scale}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">사업 정보</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">주요 제품:</span>
                <p className="text-gray-600 mt-1">{company.main_products}</p>
              </div>
              <div>
                <span className="font-medium">목표 시장:</span>
                <p className="text-gray-600 mt-1">{company.target_market}</p>
              </div>
              <div>
                <span className="font-medium">경쟁 우위:</span>
                <p className="text-gray-600 mt-1">{company.competitive_advantage}</p>
              </div>
            </div>
          </div>
        </div>

        {company.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-red-800 mb-1">거부 사유</h4>
            <p className="text-red-700 text-sm">{company.rejection_reason}</p>
          </div>
        )}

        {showActions && (company.is_approved === null || (company.is_approved === false && !company.rejection_reason)) && (
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
              onClick={() => {
                setSelectedCompany(company);
                setRejectionReason("");
                setShowRejectDialog(true);
              }}
              disabled={actionLoading}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              거부
            </Button>
          </div>
        )}

        {/* Rejected company actions: re-approve or edit rejection reason */}
        {company.is_approved === false && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => handleApprove(company)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              재승인
            </Button>
            <Button 
              onClick={() => {
                setSelectedCompany(company);
                setRejectionReason(company.rejection_reason || "");
                setShowRejectDialog(true);
              }}
              disabled={actionLoading}
              variant="outline"
            >
              <XCircle className="h-4 w-4 mr-2" />
              반려 사유 수정
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                관리자 대시보드
              </h1>
              <p className="text-slate-600 mt-2 text-lg">KnowWhere Bridge 플랫폼 통합 관리 센터</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
              <Button
                onClick={fetchAllData}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <div className="text-sm text-slate-600 text-right">
                <div>마지막 업데이트</div>
                <div className="font-medium">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{pendingCompanies.length}</div>
                  <div className="text-slate-600 font-medium">승인 대기</div>
                  <div className="text-xs text-slate-500 mt-1">검토 필요 기업</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{approvedCompanies.length}</div>
                  <div className="text-slate-600 font-medium">승인 완료</div>
                  <div className="text-xs text-slate-500 mt-1">활성 회원사</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">{rejectedCompanies.length}</div>
                  <div className="text-slate-600 font-medium">거부됨</div>
                  <div className="text-xs text-slate-500 mt-1">승인 거부 기업</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{matchingRequests.filter(r => r.status === 'completed').length}</div>
                  <div className="text-slate-600 font-medium">완료된 분석</div>
                  <div className="text-xs text-slate-500 mt-1">AI 분석 완료</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Access Tools */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">빠른 관리 도구</CardTitle>
            <CardDescription className="text-slate-600">자주 사용하는 관리 기능에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="group hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100" 
                onClick={() => navigate('/admin/newsletter')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-800 mb-2">뉴스레터 발송</h3>
                  <p className="text-sm text-blue-600">회원사 대상 이메일 발송</p>
                </CardContent>
              </Card>
              
              <Card 
                className="group hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100" 
                onClick={() => navigate('/admin/prompts')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-purple-800 mb-2">프롬프트 관리</h3>
                  <p className="text-sm text-purple-600">AI 분석 설정 관리</p>
                </CardContent>
              </Card>
              
              <Card 
                className="group hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100" 
                onClick={() => navigate('/admin/excel')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-green-800 mb-2">데이터 관리</h3>
                  <p className="text-sm text-green-600">참조 데이터 업로드</p>
                </CardContent>
              </Card>
              
              <Card 
                className="group hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100"
                onClick={() => navigate('/')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-800 mb-2">홈으로 이동</h3>
                  <p className="text-sm text-blue-600">메인 페이지로 돌아가기</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">승인 대기 ({pendingCompanies.length})</TabsTrigger>
          <TabsTrigger value="approved">승인 완료 ({approvedCompanies.length})</TabsTrigger>
          <TabsTrigger value="rejected">거부됨 ({rejectedCompanies.length})</TabsTrigger>
          <TabsTrigger value="matching">매칭 요청 ({matchingRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="reports">리포트 리뷰 ({completedRequests.length})</TabsTrigger>
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

        {/* Matching Requests Tab */}
        <TabsContent value="matching" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">📋 매칭 요청 관리</h3>
              <p className="text-gray-600">기업의 매칭 요청을 확인하고 단계별 AI 분석을 진행합니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600">
                {matchingRequests.filter(r => r.status === 'pending').length}개 대기 중
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                {matchingRequests.filter(r => r.status === 'processing').length}개 처리 중
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {matchingRequests.filter(r => r.status === 'completed').length}개 완료
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {matchingRequests
              .filter(r => r.workflow_status !== 'admin_approved' && r.workflow_status !== 'completed')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((request) => (
                <Card key={request.id} className="border-l-4 border-orange-400">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {request.company?.company_name || 'Unknown Company'}
                          <Badge variant="outline">{request.workflow_status || 'pending'}</Badge>
                        </CardTitle>
                        <CardDescription>
                          요청일: {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                     {request.pdf_summary && (
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <h4 className="font-semibold text-sm mb-1">📄 PDF 요약 (AI)</h4>
                        <p className="text-sm text-gray-700">{request.pdf_summary}</p>
                      </div>
                    )}
                    
                     <div className="flex items-center justify-between gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={async () => {
                           if (!confirm(`요청 #${request.id} 을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
                           try {
                             setActionLoading(true);
                             const { error } = await supabase
                               .from('matching_requests')
                               .delete()
                               .eq('id', request.id);
                             if (error) throw error;
                             toast({ title: '삭제 완료', description: `요청 #${request.id} 이(가) 삭제되었습니다.` });
                             await fetchMatchingRequests();
                           } catch (e: any) {
                             toast({ title: '삭제 실패', description: e.message, variant: 'destructive' });
                           } finally {
                             setActionLoading(false);
                           }
                         }}
                       >
                         삭제
                       </Button>
                       <div className="flex items-center gap-2">
                      {(['pdf_summarized','documents_uploaded','pdf_summary_failed','admin_review'].includes(request.workflow_status as any)) && (
                            <Button
                              onClick={async () => {
                                try {
                                  setActionLoading(true);
                                  toast({ title: 'GPT 분석 요청 전송', description: `요청 ID: ${request.id}` });
                                  const { data, error } = await supabase.functions.invoke('run-gpt-analysis', {
                                    body: { matchingRequestId: request.id, adminPrompt: adminPrompts[request.id] || '' }
                                  });
                                  if (error) {
                                    console.error('GPT 분석 호출 실패:', error);
                                    toast({
                                      title: 'GPT 분석 실패',
                                      description: error.message || '서버 오류',
                                      variant: 'destructive'
                                    });
                                  } else {
                                    toast({
                                      title: 'GPT 분석 시작됨',
                                      description: '분석 결과가 업데이트되면 목록이 새로고침됩니다.'
                                    });
                                  }
                                  // 즉시 새로고침
                                  await fetchMatchingRequests();
                                  // 5초 후 한번 더 새로고침 (Edge Function 완료 대기)
                                  setTimeout(async () => {
                                    await fetchMatchingRequests();
                                  }, 5000);
                                } catch (e: any) {
                                  console.error('GPT 분석 예외:', e);
                                  toast({ title: '오류', description: e.message, variant: 'destructive' });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                            >
                          <Brain className="h-4 w-4 mr-2" /> GPT 분석 실행
                            </Button>
                      )}

                      {(request.ai_analysis) && (
                            <Button
                              onClick={async () => {
                                try {
                                  setActionLoading(true);
                                  toast({ title: 'Perplexity 분석 요청 전송', description: `요청 ID: ${request.id}` });
                                  const { data, error } = await supabase.functions.invoke('run-perplexity-analysis', { 
                                    body: { matchingRequestId: request.id, adminPrompt: adminPrompts[request.id] || '' } 
                                  });
                                  if (error) {
                                    console.error('Perplexity 분석 호출 실패:', error);
                                    toast({
                                      title: 'Perplexity 분석 실패',
                                      description: error.message || '서버 오류',
                                      variant: 'destructive'
                                    });
                                  } else {
                                    toast({
                                      title: 'Perplexity 분석 시작됨',
                                      description: '분석 결과가 업데이트되면 목록이 새로고침됩니다.'
                                    });
                                  }
                                  // 즉시 새로고침
                                  await fetchMatchingRequests();
                                  // 5초 후 한번 더 새로고침 (Edge Function 완료 대기)
                                  setTimeout(async () => {
                                    await fetchMatchingRequests();
                                  }, 5000);
                                } catch (e: any) {
                                  console.error('Perplexity 분석 예외:', e);
                                  toast({
                                    title: '오류',
                                    description: e.message,
                                    variant: 'destructive'
                                  });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                          className="bg-purple-600 hover:bg-purple-700"
                            >
                          <Globe className="h-4 w-4 mr-2" /> Perplexity 분석 실행
                            </Button>
                      )}

                      {(request.workflow_status === 'perplexity_completed' || request.workflow_status === 'gpt_completed') && (
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowReportDialog(true);
                          }}
                          variant="outline"
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" /> 리포트 검토
                        </Button>
                      )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Report Review Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">📊 AI 분석 리포트 검토</h3>
              <p className="text-gray-600">완료된 AI 분석 리포트를 검토하고 최종 승인할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowPdfAnalysisDialog(true)}
                variant="default"
                size="sm"
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="h-4 w-4" />
                📄 PDF 분석 테스트
              </Button>
              <Button
                onClick={fetchMatchingRequests}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                🔄 새로고침
              </Button>
              <Badge variant="outline" className="text-green-600">
                {completedRequests.length}개 검토 대기
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">검토할 리포트가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              completedRequests.map((request) => (
                <Card key={request.id} className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {request.company?.company_name || 'Unknown Company'}
                          <Badge className="bg-green-100 text-green-800">
                            ✅ 분석 완료
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          📧 {request.company?.email} | 
                          🏢 {request.company?.industry} |
                          📅 완료일: {new Date(request.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowReportDialog(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        리포트 상세 검토
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기업 등록 거부</DialogTitle>
            <DialogDescription>
              {selectedCompany?.company_name}의 등록을 거부하는 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">거부 사유</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거부 사유를 상세히 입력해주세요..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={actionLoading || !rejectionReason.trim()}
              variant="destructive"
            >
              거부하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Detail Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              📊 AI 분석 리포트 상세 검토
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedRequest?.companies?.company_name}의 종합 분석 리포트를 검토하고 최종 승인하세요.
            </DialogDescription>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline">
                {selectedRequest?.workflow_status === 'admin_approved' ? '승인 완료' : '검토 대기'}
              </Badge>
              {(selectedRequest as any)?.report_token && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">보고서 URL:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    /report/{(selectedRequest as any).report_token.substring(0, 8)}...
                  </code>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-8">
              {/* Company Information Summary */}
              <div className="bg-slate-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  기업 정보 요약
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">회사명:</span>
                    <p className="font-semibold">{selectedRequest.companies?.company_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">업종:</span>
                    <p>{selectedRequest.companies?.industry}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">타겟 국가:</span>
                    <p>{selectedRequest.target_countries?.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">요청일:</span>
                    <p>{new Date(selectedRequest.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              </div>

              {/* GPT Analysis Section */}
              {(selectedRequest.ai_analysis || selectedRequest.gpt_analysis) && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    🤖 GPT 종합 분석 리포트
                    <Badge variant="secondary">AI 분석</Badge>
                  </h3>
                  <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                    {Object.entries(sanitizeAiObject((selectedRequest.ai_analysis || selectedRequest.gpt_analysis) || {}, 'gpt')).map(([key, value]) => (
                      <div key={key} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50/30 rounded-r-lg">
                        <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                          📋 {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          {renderSmartValue(value, 'blue')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perplexity Analysis Section - Beautiful Display */}
              {selectedRequest.market_research && (
                <MarketResearchDisplay 
                  data={selectedRequest.market_research}
                  citations={selectedRequest.market_research.citations || selectedRequest.market_research?.data?.citations}
                />
              )}

              {/* Raw Content Section for Debugging */}
              {(selectedRequest.market_research?.data?.parsing_error || selectedRequest.market_research?.data?.raw_content) && (
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      ⚠️ 원본 데이터 (파싱 오류 발생)
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => setShowRawDebug(prev => !prev)}>
                      {showRawDebug ? '원본 숨기기' : '원본 보기'}
                    </Button>
                  </div>
                  {showRawDebug && (
                    <div className="bg-white p-4 rounded border max-h-60 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.market_research.data.raw_content || JSON.stringify(selectedRequest.market_research.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Review Section */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💬 관리자 검토 및 승인
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-prompt" className="text-sm font-medium text-yellow-900 mb-2 block">
                      🔧 추가 분석 지시사항 (선택사항)
                    </Label>
                    <Textarea
                      id="admin-prompt"
                      placeholder="예: 한국 시장 규제와 인증 절차를 강조해서 분석해줘, 경쟁사 분석을 더 자세히 해줘"
                      value={adminPrompts[selectedRequest?.id] || ''}
                      onChange={(e) => setAdminPrompts(prev => ({ ...prev, [selectedRequest!.id]: e.target.value }))}
                      className="h-20 mb-4"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="admin-comments" className="text-base font-semibold text-yellow-900 mb-2 block">
                      📝 최종 검토 의견 및 승인 코멘트
                    </Label>
                    <Textarea
                      id="admin-comments"
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      placeholder="리포트 품질 평가, 수정 필요사항, 추가 권고사항, 고객에게 전달할 메시지 등을 입력하세요..."
                      className="h-32 border-yellow-300 focus:border-yellow-500"
                    />
                  </div>

                  {/* (요청에 따라 품질/완성도 선택 UI 제거) */}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>검토 시작: {new Date().toLocaleString('ko-KR')}</span>
              </div>
               <div className="flex items-center gap-3">
                <Button 
                  variant="destructive" 
                  onClick={async () => {
                    if (!selectedRequest || !confirm('이 보고서를 삭제하시겠습니까? 삭제된 보고서는 사용자가 볼 수 없게 됩니다.')) return;
                    
                    setActionLoading(true);
                    try {
                      const { error } = await supabase
                        .from('matching_requests')
                        .update({ 
                          ai_analysis: null,
                          market_research: null,
                          final_report: null,
                          report_token: null,
                          is_deleted: true,
                          deleted_at: new Date().toISOString(),
                          workflow_status: 'deleted'
                        })
                        .eq('id', selectedRequest.id);

                      if (error) throw error;

                      toast({
                        title: "보고서 삭제 완료",
                        description: "보고서가 삭제되었습니다. 사용자는 더 이상 이 보고서에 접근할 수 없습니다.",
                      });

                      setShowReportDialog(false);
                      fetchMatchingRequests();
                    } catch (error: any) {
                      toast({
                        title: "삭제 실패",
                        description: error.message,
                        variant: "destructive"
                      });
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="px-6"
                >
                  🗑️ 보고서 삭제
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportDialog(false)} 
                  className="px-6"
                  disabled={actionLoading}
                >
                  취소
                </Button>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    if (!selectedRequest || !adminComments.trim()) {
                      toast({
                        title: "검토 의견 필요",
                        description: "승인 전에 검토 의견을 입력해주세요.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setActionLoading(true);
                    try {
                      // Update with admin comments but keep in review status
                      const { error } = await supabase
                        .from('matching_requests')
                        .update({ 
                          admin_comments: adminComments,
                          workflow_status: 'admin_review_pending'
                        })
                        .eq('id', selectedRequest.id);

                      if (error) throw error;

                      toast({
                        title: "검토 의견 저장됨",
                        description: "검토 의견이 저장되었습니다. 추가 검토 후 승인해주세요.",
                      });

                      fetchMatchingRequests();
                    } catch (error: any) {
                      toast({
                        title: "저장 실패",
                        description: error.message,
                        variant: "destructive"
                      });
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading || !adminComments.trim()}
                  className="px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  검토 의견 저장
                </Button>
                <Button 
                  onClick={async () => {
                    if (!selectedRequest) return;
                    
                    if (!adminComments.trim()) {
                      toast({
                        title: "검토 의견 필요",
                        description: "최종 승인 전에 검토 의견을 입력해주세요.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setActionLoading(true);
                    try {
                      // Final Report Structure
                      const final_report = {
                        gpt_analysis: selectedRequest.ai_analysis || selectedRequest.gpt_analysis,
                        market_research: selectedRequest.market_research,
                        admin_comments: adminComments,
                        admin_approval_date: new Date().toISOString(),
                        report_quality: 'approved',
                        generated_at: new Date().toISOString(),
                      };
                      
                      // Update request with admin comments and mark as completed
                      const { error } = await supabase
                        .from('matching_requests')
                        .update({ 
                          admin_comments: adminComments,
                          status: 'completed',
                          final_report: final_report,
                          completed_at: new Date().toISOString(),
                          workflow_status: 'admin_approved'
                        })
                        .eq('id', selectedRequest.id);

                      if (error) throw error;

                       // Generate secure report link token
                       const { data: tokenData, error: tokenError } = await supabase.rpc('generate_report_token', { p_id: selectedRequest.id });
                       if (tokenError) {
                         console.error('Token generation failed:', tokenError);
                       }

                       // Send completion email to company
                      try {
                        const { error: emailError } = await supabase.functions.invoke('send-analysis-complete-email', {
                          body: {
                            matchingRequestId: selectedRequest.id,
                            adminComments: adminComments
                          },
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });

                        if (emailError) {
                          console.error('Email sending failed:', emailError);
                          toast({
                            title: "승인 완료 (이메일 전송 실패)",
                            description: "리포트가 승인되었지만 이메일 전송에 실패했습니다.",
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "✅ 리포트 최종 승인 완료",
                            description: "리포트가 최종 승인되었고 고객에게 완료 알림이 전송되었습니다.",
                          });
                        }
                      } catch (emailError) {
                        console.error('Email sending failed:', emailError);
                        // Don't show error toast for email failure, just log it
                        toast({
                          title: "✅ 리포트 승인 완료",
                          description: "리포트가 최종 승인되었습니다.",
                        });
                      }

                      setShowReportDialog(false);
                      setSelectedRequest(null);
                      setAdminComments("");
                      fetchMatchingRequests();
                    } catch (error: any) {
                  toast({
                    title: "승인 실패",
                    description: error.message,
                    variant: "destructive",
                  });
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
            >
              <Mail className="h-4 w-4 mr-2" />
              최종 승인 및 배포
            </Button>
                 {selectedRequest?.workflow_status === 'admin_approved' && (
                   <Button 
                     variant="outline"
                     onClick={async () => {
                       if (!selectedRequest) return;
                       try {
                         setActionLoading(true);
                         const { error: tokenErr } = await supabase.rpc('generate_report_token', { p_id: selectedRequest.id });
                         if (tokenErr) throw tokenErr;

                         await supabase.functions.invoke('send-analysis-complete-email', {
                           body: { matchingRequestId: selectedRequest.id, adminComments },
                           headers: { 'Content-Type': 'application/json' }
                         });
                         toast({ title: '리포트 재발행 완료', description: '고객에게 새 링크가 전송되었습니다.' });
                       } catch (e: any) {
                         toast({ title: '재발행 실패', description: e.message, variant: 'destructive' });
                       } finally {
                         setActionLoading(false);
                       }
                     }}
                   >
                     재발행(이메일 전송)
                   </Button>
                 )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Analysis Test Dialog */}
      <Dialog open={showPdfAnalysisDialog} onOpenChange={setShowPdfAnalysisDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF 분석 테스트
            </DialogTitle>
            <DialogDescription>
              PDF 파일을 업로드하여 AI 분석을 테스트할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">PDF 파일 선택</Label>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFile(file);
                  }
                }}
                disabled={pdfAnalysisLoading}
              />
              {pdfFile && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Test Company Selection */}
            <div className="space-y-2">
              <Label>테스트할 기업 선택</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="기업을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {approvedCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Countries */}
            <div className="space-y-2">
              <Label>타겟 국가 (쉼표로 구분)</Label>
              <Input
                placeholder="예: 미국, 일본, 독일"
                defaultValue="미국, 일본, 독일"
              />
            </div>

            {/* Processing Status */}
            {pdfAnalysisLoading && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <div>
                    <p className="font-semibold text-blue-800">PDF 분석 중...</p>
                    <p className="text-sm text-blue-600">GPT-4와 Perplexity AI로 종합 분석을 수행하고 있습니다.</p>
                  </div>
                </div>
                <Progress className="mt-3" value={33} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfAnalysisDialog(false);
                setPdfFile(null);
              }}
              disabled={pdfAnalysisLoading}
            >
              취소
            </Button>
            <Button
              onClick={async () => {
                if (!pdfFile) {
                  toast({
                    title: "파일 선택 필요",
                    description: "PDF 파일을 선택해주세요.",
                    variant: "destructive",
                  });
                  return;
                }

                setPdfAnalysisLoading(true);
                
                try {
                  // First check if the bucket exists
                  const { data: buckets } = await supabase.storage.listBuckets();
                  const pdfUploadsBucket = buckets?.find(b => b.name === 'pdf-uploads');
                  
                  if (!pdfUploadsBucket) {
                    throw new Error('Storage bucket "pdf-uploads" does not exist. Please run: npx supabase storage create pdf-uploads --public');
                  }
                  
                  // 1. Upload PDF to Supabase Storage
                  const fileName = `test-${Date.now()}-${pdfFile.name}`;
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('pdf-uploads')
                    .upload(fileName, pdfFile);

                  if (uploadError) throw uploadError;

                  // 2. Get public URL
                  const { data: { publicUrl } } = supabase.storage
                    .from('pdf-uploads')
                    .getPublicUrl(fileName);

                  // 3. Create a test matching request
                  const { data: testRequest, error: requestError } = await supabase
                    .from('matching_requests')
                    .insert({
                      company_id: approvedCompanies[0]?.id || 1, // Use first approved company or default
                      target_countries: ['미국', '일본', '독일'],
                      company_description: 'PDF 분석 테스트',
                      product_info: 'PDF 문서 참조',
                      business_goals: 'AI 분석 테스트',
                      workflow_status: 'pdf_uploaded',
                      status: 'processing'
                    })
                    .select()
                    .single();

                  if (requestError) throw requestError;

                  // 4. Call process-pdf-report function
                  const { data, error } = await supabase.functions.invoke('process-pdf-report', {
                    body: {
                      matchingRequestId: testRequest.id,
                      pdfUrl: publicUrl
                    }
                  });

                  if (error) throw error;

                  toast({
                    title: "✅ PDF 분석 완료",
                    description: "AI 분석이 완료되었습니다. Report Review 탭에서 확인하세요.",
                  });

                  // Refresh data and close dialog
                  fetchMatchingRequests();
                  setShowPdfAnalysisDialog(false);
                  setPdfFile(null);

                } catch (error: any) {
                  console.error('PDF analysis error:', error);
                  
                  let errorMessage = error.message || "PDF 분석 중 오류가 발생했습니다.";
                  let errorDetails = "";
                  
                  // Check for specific error types
                  if (error.message?.includes('Storage') || error.message?.includes('storage') || error.message?.includes('bucket')) {
                    errorMessage = "PDF 업로드 실패: Storage 버킷이 설정되지 않았습니다.";
                    errorDetails = "터미널에서 다음 명령을 실행하세요:\nnpx supabase storage create pdf-uploads --public";
                  } else if (error.message?.includes('API key')) {
                    errorMessage = "API 키가 설정되지 않았습니다.";
                    errorDetails = "OpenAI 또는 Perplexity API 키를 확인하세요.";
                  } else if (error.message?.includes('Edge Function') || error.message?.includes('function')) {
                    errorMessage = "Edge Function 호출 실패";
                    errorDetails = "process-pdf-report 함수가 배포되었는지 확인하세요.";
                  } else if (error.message?.includes('not found')) {
                    errorMessage = "리소스를 찾을 수 없습니다.";
                    errorDetails = "Storage 버킷 또는 Edge Function이 존재하지 않습니다.";
                  }
                  
                  // Log detailed error for debugging
                  console.error('Detailed error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                  });
                  
                  toast({
                    title: "❌ PDF 분석 실패",
                    description: errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage,
                    variant: "destructive",
                  });
                } finally {
                  setPdfAnalysisLoading(false);
                }
              }}
              disabled={!pdfFile || pdfAnalysisLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              분석 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
/*
  NOTE: Legacy Admin page.
  This file is no longer routed directly; the Admin area has been migrated
  to structured routes under /admin with a reusable layout. To reduce noise
  while keeping this file for reference, we disable the explicit-any rule here.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
