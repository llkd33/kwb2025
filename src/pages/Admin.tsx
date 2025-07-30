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
  FileSpreadsheet, Brain, Upload, Edit, Trash2, Save, Plus, Settings, RefreshCw
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

  // Filter companies by status
  const pendingCompanies = companies.filter(c => c.is_approved === null);
  const approvedCompanies = companies.filter(c => c.is_approved === true);
  const rejectedCompanies = companies.filter(c => c.is_approved === false);

  // Filter completed requests for report review
  const completedRequests = matchingRequests.filter(request => 
    request.status === 'completed' && request.ai_analysis && request.market_research
  );

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

  // Company Card Component
  const CompanyCard = ({ company, showActions = false }: { company: Company; showActions?: boolean }) => (
    <Card key={company.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.company_name}
              {company.is_approved === true && <Badge className="bg-green-100 text-green-800">승인됨</Badge>}
              {company.is_approved === false && <Badge variant="destructive">거부됨</Badge>}
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

        {showActions && company.is_approved === null && (
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
              <p className="text-gray-600">기업의 매칭 요청을 확인하고 AI 분석을 시작할 수 있습니다.</p>
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
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((request) => (
                <Card key={request.id} className={`border-2 ${
                  request.status === 'pending' ? 'border-orange-200 bg-orange-50' :
                  request.status === 'processing' ? 'border-blue-200 bg-blue-50' :
                  request.status === 'completed' ? 'border-green-200 bg-green-50' :
                  'border-gray-200'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {request.companies?.company_name || 'Unknown Company'}
                          <Badge 
                            variant={
                              request.status === 'pending' ? 'secondary' :
                              request.status === 'processing' ? 'default' :
                              request.status === 'completed' ? 'outline' :
                              'secondary'
                            }
                            className={
                              request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              ''
                            }
                          >
                            {request.status === 'pending' ? '🟡 대기 중' :
                             request.status === 'processing' ? '🔵 처리 중' :
                             request.status === 'completed' ? '🟢 완료' : request.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          📧 {request.companies?.email} | 
                          🏢 {request.companies?.industry} | 
                          🌍 {request.companies?.headquarters_country} |
                          📅 요청일: {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={async () => {
                                setActionLoading(true);
                                try {
                                  // Test minimal analysis first
                                  const { error } = await supabase.functions.invoke('minimal-analysis', {
                                    body: { matchingRequestId: request.id }
                                  });

                                  if (error) {
                                    console.error('Minimal analysis error:', error);
                                    toast({
                                      title: "최소 분석 실패",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  } else {
                                    toast({
                                      title: "최소 분석 성공",
                                      description: "간단한 AI 분석이 완료되었습니다.",
                                    });
                                    fetchMatchingRequests();
                                  }
                                } catch (error: any) {
                                  toast({
                                    title: "최소 분석 실패",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                              size="sm"
                              variant="outline"
                              className="border-blue-300 hover:bg-blue-100"
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              최소 분석
                            </Button>
                            <Button
                              onClick={async () => {
                                setActionLoading(true);
                                try {
                                  // Update status to processing first
                                  const { error: updateError } = await supabase
                                    .from('matching_requests')
                                    .update({ status: 'processing' })
                                    .eq('id', request.id);

                                  if (updateError) throw updateError;

                                  // Refresh UI immediately
                                  fetchMatchingRequests();

                                  // Start comprehensive analysis
                                  const { error } = await supabase.functions.invoke('comprehensive-analysis', {
                                    body: { matchingRequestId: request.id }
                                  });

                                  if (error) {
                                    console.error('Analysis error:', error);
                                    
                                    // Revert status back to pending on error
                                    await supabase
                                      .from('matching_requests')
                                      .update({ status: 'pending' })
                                      .eq('id', request.id);
                                    
                                    toast({
                                      title: "분석 시작 실패",
                                      description: error.message || "분석을 시작할 수 없습니다.",
                                      variant: "destructive",
                                    });
                                  } else {
                                    toast({
                                      title: "분석 시작됨",
                                      description: "AI 분석이 시작되었습니다. 완료까지 몇 분 소요될 수 있습니다.",
                                    });
                                  }
                                  
                                  // Refresh matching requests again
                                  fetchMatchingRequests();
                                } catch (error: any) {
                                  toast({
                                    title: "분석 시작 실패",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              전체 분석
                            </Button>
                          </div>
                        )}
                        {request.status === 'processing' && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                            <span className="text-sm">처리 중...</span>
                          </div>
                        )}
                        {request.status === 'completed' && (
                          <Badge className="bg-green-600 text-white">
                            ✅ 완료
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">매칭 요청 정보</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">타겟 국가:</span>
                            <div className="mt-1">
                              {request.target_countries?.map((country: string, index: number) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {request.company_description && (
                            <div>
                              <span className="font-medium">회사 설명:</span>
                              <p className="text-gray-600 mt-1">{request.company_description}</p>
                            </div>
                          )}
                          {request.product_info && (
                            <div>
                              <span className="font-medium">제품 정보:</span>
                              <p className="text-gray-600 mt-1">{request.product_info}</p>
                            </div>
                          )}
                        </div>
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
                          {request.companies?.company_name || 'Unknown Company'}
                          <Badge className="bg-green-100 text-green-800">
                            ✅ 분석 완료
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          📧 {request.companies?.email} | 
                          🏢 {request.companies?.industry} | 
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              📊 AI 분석 리포트 상세 검토
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.companies?.company_name}의 종합 분석 리포트를 검토하고 최종 승인하세요.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* AI Analysis Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🤖 AI 분석 결과</h3>
                {selectedRequest.ai_analysis ? (
                  <div className="bg-white p-4 rounded shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {typeof selectedRequest.ai_analysis === 'string' 
                        ? selectedRequest.ai_analysis 
                        : JSON.stringify(selectedRequest.ai_analysis, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                    AI 분석 데이터를 불러올 수 없습니다
                  </div>
                )}
              </div>

              {/* Market Research Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🌍 시장 분석 결과</h3>
                {selectedRequest.market_research ? (
                  <div className="bg-white p-4 rounded shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {typeof selectedRequest.market_research === 'string' 
                        ? selectedRequest.market_research 
                        : JSON.stringify(selectedRequest.market_research, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                    시장 분석 데이터를 불러올 수 없습니다
                  </div>
                )}
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
              onClick={async () => {
                if (!selectedRequest) return;
                
                setActionLoading(true);
                try {
                  // Update request with admin comments and finalized status
                  const { error } = await supabase
                    .from('matching_requests')
                    .update({ 
                      admin_comments: adminComments,
                      status: 'finalized',
                      finalized_at: new Date().toISOString()
                    })
                    .eq('id', selectedRequest.id);

                  if (error) throw error;

                  // Send completion email to company
                  const { error: emailError } = await supabase.functions.invoke('send-analysis-complete-email', {
                    body: {
                      matchingRequestId: selectedRequest.id,
                      adminComments: adminComments
                    }
                  });

                  if (emailError) {
                    console.error('Email sending failed:', emailError);
                  }

                  toast({
                    title: "리포트 승인 완료",
                    description: "리포트가 최종 승인되었고 고객에게 알림이 전송되었습니다.",
                  });

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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}