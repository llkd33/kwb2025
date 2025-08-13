import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Building2, User, Mail, Phone, MapPin, Calendar, 
  FileText, CheckCircle, AlertCircle, Clock, 
  LogOut, Edit, Globe, Users, Target, Upload
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
  approved_at: string;
}

interface BusinessRegistration {
  id: number;
  document_name: string;
  uploaded_at: string;
  is_verified: boolean;
  verification_notes?: string;
}

interface MatchingRequest {
  id: number;
  target_countries: string[];
  status: string;
  created_at: string;
  completed_at?: string;
}

export default function Dashboard() {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [businessDocs, setBusinessDocs] = useState<BusinessRegistration[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<MatchingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const company = localStorage.getItem('currentCompany');
    if (company) {
      const parsedCompany = JSON.parse(company);
      setCurrentCompany(parsedCompany);
      fetchDashboardData(parsedCompany.id);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const fetchDashboardData = async (companyId: number) => {
    try {
      // Documents module disabled: skip fetching
      setBusinessDocs([]);

      // Fetch matching requests
      const { data: requests, error: requestsError } = await supabase
        .from('matching_requests')
        .select('id, target_countries, status, created_at, completed_at, report_token')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setMatchingRequests(requests || []);

    } catch (error: any) {
      toast({
        title: "데이터 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentCompany');
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
    });
    navigate('/');
  };

  if (!currentCompany) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>로그인이 필요합니다.</p>
            <Button asChild className="mt-4">
              <a href="/auth">로그인</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  const getApprovalStatusBadge = () => {
    if (currentCompany.is_approved) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          승인완료
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          승인대기
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Header with Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="hover:bg-blue-50"
              >
                <Building2 className="h-5 w-5 mr-2" />
                홈으로
              </Button>
              <div className="border-l border-slate-200 h-8 mx-2"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  마이페이지
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {currentCompany.company_name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl text-blue-600">{getApprovalStatusBadge()}</CardTitle>
            <CardDescription>계정 승인 상태</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl text-green-600">{businessDocs.length}</CardTitle>
            <CardDescription>업로드된 서류</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl text-purple-600">{matchingRequests.length}</CardTitle>
            <CardDescription>매칭 요청</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl text-orange-600">
              {matchingRequests.filter(r => r.status === 'completed').length}
            </CardTitle>
            <CardDescription>완료된 분석</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="company-info">회사정보</TabsTrigger>
          <TabsTrigger value="matching">매칭요청</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {!currentCompany.is_approved && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  승인 대기 중
                </CardTitle>
                <CardDescription className="text-orange-700">
                  관리자 승인이 완료되면 모든 서비스를 이용하실 수 있습니다. 
                  사업자등록증 업로드를 완료하셨는지 확인해주세요.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessDocs.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(doc.uploaded_at).toLocaleDateString()} 업로드
                      </p>
                    </div>
                    {doc.is_verified ? (
                      <Badge className="bg-green-100 text-green-800">검증완료</Badge>
                    ) : (
                      <Badge variant="secondary">검증대기</Badge>
                    )}
                  </div>
                ))}
                {businessDocs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    업로드된 서류가 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info Tab */}
        <TabsContent value="company-info" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>회사 정보</CardTitle>
                <CardDescription>등록된 회사 정보를 확인하세요</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">회사명</p>
                      <p className="text-gray-600">{currentCompany.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">대표자</p>
                      <p className="text-gray-600">{currentCompany.ceo_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">이메일</p>
                      <p className="text-gray-600">{currentCompany.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">연락처</p>
                      <p className="text-gray-600">{currentCompany.phone_number}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">본사 위치</p>
                      <p className="text-gray-600">
                        {currentCompany.headquarters_country} {currentCompany.headquarters_city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">설립연도</p>
                      <p className="text-gray-600">{currentCompany.founding_year || '미입력'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">직원 수</p>
                      <p className="text-gray-600">{currentCompany.employee_count || '미입력'}</p>
                    </div>
                  </div>
                  {currentCompany.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">웹사이트</p>
                        <a 
                          href={currentCompany.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {currentCompany.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {currentCompany.main_products && (
                <div className="mt-6 pt-6 border-t">
                  <p className="font-medium mb-2">주요 제품/서비스</p>
                  <p className="text-gray-600">{currentCompany.main_products}</p>
                </div>
              )}
              
              {currentCompany.target_market && (
                <div className="mt-4">
                  <p className="font-medium mb-2">타겟 시장</p>
                  <p className="text-gray-600">{currentCompany.target_market}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab removed */}

        {/* Matching Tab */}
        <TabsContent value="matching" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">매칭 요청</h3>
              <p className="text-gray-600">해외진출 매칭 요청 현황</p>
            </div>
            <Button disabled={!currentCompany.is_approved} asChild>
              <a href="/matching-request">
                <Target className="h-4 w-4 mr-2" />
                새 매칭 요청
              </a>
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {matchingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">매칭 요청이 없습니다.</p>
                  {!currentCompany.is_approved ? (
                    <p className="text-sm text-orange-600">계정 승인 후 매칭 요청이 가능합니다.</p>
                  ) : (
                    <Button asChild className="mt-4">
                      <a href="/matching-request">
                        <Target className="h-4 w-4 mr-2" />
                        첫 매칭 요청하기
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingRequests.map((request) => (
                    <Card key={request.id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            매칭 요청 #{request.id}
                          </h4>
                          <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                            {request.status === 'completed' ? '분석완료' : request.status === 'pending' ? '분석중' : '진행중'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>타겟 국가:</strong> {request.target_countries.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            요청일: {(() => {
                              const date = new Date(request.created_at);
                              return isNaN(date.getTime()) ? '날짜 오류' : date.toLocaleDateString('ko-KR');
                            })()}
                            {request.completed_at && (
                              <> · 완료일: {(() => {
                                const date = new Date(request.completed_at);
                                return isNaN(date.getTime()) ? '날짜 오류' : date.toLocaleDateString('ko-KR');
                              })()}</>
                            )}
                          </p>
                          
                          {request.status === 'completed' && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-green-800">📊 AI 분석 완료</h5>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <p className="text-sm text-green-700 mb-3">
                                Goldman Sachs급 종합 분석 리포트가 준비되었습니다.
                              </p>
                              <div className="flex items-center gap-2">
                                {(request as any).report_token ? (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                                    <a href={`/report/${(request as any).report_token}`}>
                                      <FileText className="h-4 w-4 mr-1" />
                                      분석 결과 보기
                                    </a>
                                  </Button>
                                ) : (
                                  <p className="text-sm text-gray-500">보고서 토큰 생성 필요 (관리자 문의)</p>
                                )}
                                <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={async () => {
                                    if (!confirm('이 리포트를 삭제하시겠습니까? 삭제 후 어드민에서 재발행이 가능합니다.')) return;
                                    try {
                                      const { error } = await supabase
                                        .from('connection_requests')
                                        .update({ final_report: null, ai_analysis: null, market_research: null })
                                        .eq('id', request.id);
                                      if (error) throw error;
                                      toast({ title: '리포트 삭제 완료', description: `요청 #${request.id}` });
                                      fetchDashboardData(currentCompany.id);
                                    } catch (e: any) {
                                      toast({ title: '삭제 실패', description: e.message, variant: 'destructive' });
                                    }
                                  }}
                                >
                                  삭제
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {request.status === 'pending' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                                <h5 className="font-medium text-blue-800">AI 분석 진행중</h5>
                              </div>
                              <p className="text-sm text-blue-700">
                                GPT-4 + Perplexity AI가 종합 분석 중입니다. 완료되면 이메일로 알려드립니다.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}