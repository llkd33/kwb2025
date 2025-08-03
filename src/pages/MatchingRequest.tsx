import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Globe, Target, Brain, CheckCircle, AlertCircle } from "lucide-react";

const COUNTRIES = [
  // 아시아
  "한국", "일본", "싱가포르", "대만", "홍콩", "필리핀", "인도네시아", "말레이시아", "베트남", "태국", "인도",
  // 중동
  "UAE", "사우디", "카타르",
  // 북미
  "미국", "캐나다",
  // 유럽
  "독일", "영국", "프랑스", "이탈리아", "스페인", "네덜란드", "스위스",
  // 오세아니아
  "호주", "뉴질랜드"
];

interface CompanyProfile {
  id: number;
  document_url: string;
  document_name: string;
  uploaded_at: string;
}

export default function MatchingRequest() {
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [companyDescription, setCompanyDescription] = useState("");
  const [additionalQuestions, setAdditionalQuestions] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [marketInfo, setMarketInfo] = useState("");
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const company = localStorage.getItem('currentCompany');
    if (company) {
      const parsedCompany = JSON.parse(company);
      setCurrentCompany(parsedCompany);
      fetchCompanyProfiles(parsedCompany.id);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const fetchCompanyProfiles = async (companyId: number) => {
    try {
      const { data, error } = await supabase.storage
        .from('business-documents')
        .list(`${companyId}`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      const profiles = data?.filter(file => 
        file.name.includes('profile') || file.name.includes('company') || file.name.includes('소개')
      ).map(file => ({
        id: Math.random(),
        document_url: `${companyId}/${file.name}`,
        document_name: file.name,
        uploaded_at: file.created_at || new Date().toISOString()
      })) || [];

      setCompanyProfiles(profiles);
    } catch (error: any) {
      console.error('Error fetching company profiles:', error);
    }
  };

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "파일 형식 오류",
        description: "PDF, DOC, DOCX 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "파일 크기 오류",
        description: "파일 크기는 10MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadProfile = async () => {
    if (!selectedFile || !currentCompany) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `company-profile-${Date.now()}.${fileExt}`;
      const filePath = `${currentCompany.id}/${fileName}`;

      setUploadProgress(25);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      toast({
        title: "업로드 완료",
        description: "회사 소개서가 성공적으로 업로드되었습니다.",
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('company-profile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchCompanyProfiles(currentCompany.id);
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

  const handleSubmitRequest = async () => {
    if (!currentCompany || selectedCountries.length === 0) {
      toast({
        title: "필수 정보 누락",
        description: "진출 희망 국가를 최소 1개 이상 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create matching request
      const { data: newRequest, error } = await supabase
        .from('matching_requests')
        .insert({
          company_id: currentCompany.id,
          target_countries: selectedCountries,
          company_description: companyDescription,
          additional_questions: additionalQuestions,
          product_info: productInfo,
          market_info: marketInfo,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Start AI analysis in background
      const analysisStarted = await supabase.functions.invoke('comprehensive-analysis', {
        body: {
          matchingRequestId: newRequest.id
        }
      });

      if (analysisStarted.error) {
        console.error('Failed to start analysis:', analysisStarted.error);
        // Don't throw error - the request was created successfully
        toast({
          title: "매칭 요청 완료",
          description: "요청이 접수되었으나 분석 시작에 실패했습니다. 관리자에게 문의해주세요.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "매칭 요청 완료",
          description: "AI 분석이 시작되었습니다. 완료되면 이메일로 알려드리겠습니다. (약 5-10분 소요)",
        });
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "요청 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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

  if (!currentCompany.is_approved) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              승인 대기 중
            </CardTitle>
            <CardDescription className="text-orange-700">
              관리자 승인이 완료되어야 매칭 요청을 하실 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/dashboard">마이페이지로 돌아가기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI 매칭 분석 요청
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              {currentCompany.company_name}의 글로벌 진출을 위한 맞춤 분석을 시작합니다
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        {/* Enhanced Progress Steps */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <span className="mt-3 font-semibold text-blue-700">기본 정보</span>
                <span className="text-xs text-blue-600 mt-1">현재 단계</span>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-slate-300 mx-4"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-300 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <span className="mt-3 text-slate-500 font-medium">AI 분석</span>
                <span className="text-xs text-slate-400 mt-1">5-10분 소요</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-300 mx-4"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-300 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <span className="mt-3 text-slate-500 font-medium">결과 확인</span>
                <span className="text-xs text-slate-400 mt-1">이메일 발송</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Country Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              진출 희망 국가 선택
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              AI 분석을 원하는 국가를 선택해주세요. 복수 선택이 가능하며, 더 많은 국가를 선택할수록 정확한 분석이 가능합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Country Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {COUNTRIES.map((country) => {
                  const isSelected = selectedCountries.includes(country);
                  return (
                    <div 
                      key={country} 
                      className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isSelected 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => handleCountryToggle(country)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={country}
                          checked={isSelected}
                          onCheckedChange={() => handleCountryToggle(country)}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label htmlFor={country} className="font-medium cursor-pointer group-hover:text-blue-600">
                          {country}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Countries Summary */}
              {selectedCountries.length > 0 && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-semibold text-blue-800">
                      선택된 국가 ({selectedCountries.length}개)
                    </p>
                    <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {selectedCountries.length >= 3 ? '최적 분석 가능' : '더 선택하시면 정확도가 향상됩니다'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((country) => (
                      <span 
                        key={country}
                        className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      {/* Company Profile Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            회사 소개서 업로드
          </CardTitle>
          <CardDescription>
            더 정확한 분석을 위해 회사 소개서를 업로드해주세요. (선택사항)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-profile">파일 선택</Label>
            <Input
              id="company-profile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
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
            onClick={handleUploadProfile} 
            disabled={!selectedFile || uploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "업로드 중..." : "업로드"}
          </Button>

          {companyProfiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">업로드된 소개서:</p>
              <div className="space-y-2">
                {companyProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{profile.document_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            추가 정보
          </CardTitle>
          <CardDescription>
            더 정확한 분석을 위해 추가 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_description">회사 및 비즈니스 모델 설명</Label>
            <Textarea
              id="company_description"
              placeholder="회사의 핵심 비즈니스 모델과 특징을 간단히 설명해주세요..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_info">주요 제품/서비스 상세 정보</Label>
            <Textarea
              id="product_info"
              placeholder="해외진출을 계획하는 주요 제품이나 서비스에 대해 상세히 설명해주세요..."
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market_info">기존 시장 경험 및 성과</Label>
            <Textarea
              id="market_info"
              placeholder="기존에 진출한 해외 시장이 있다면 경험과 성과를 공유해주세요..."
              value={marketInfo}
              onChange={(e) => setMarketInfo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_questions">특별히 궁금한 점이나 중점 분석 요청사항</Label>
            <Textarea
              id="additional_questions"
              placeholder="특별히 알고 싶은 시장 정보나 분석 요청사항이 있다면 자유롭게 작성해주세요..."
              value={additionalQuestions}
              onChange={(e) => setAdditionalQuestions(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

        {/* Enhanced Submit Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              AI 분석 요청
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              입력하신 정보를 바탕으로 Goldman Sachs 급 AI 분석을 시작합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Analysis Preview */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl mb-8 border border-slate-200">
              <h4 className="font-bold text-lg mb-4 text-slate-800">분석 내용 미리보기</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">GPT-4 기반 종합 기업 분석</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">Perplexity AI 실시간 시장 동향</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">관리자 데이터 교차 검증</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">진출 전략 및 리스크 분석</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">파트너 매칭 추천</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">투자자 연결 기회</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmitRequest}
              disabled={submitting || selectedCountries.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg py-6 h-16 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>AI 분석 요청 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6" />
                  <span>AI 분석 시작하기</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>

            {/* Info Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">분석 완료까지 약 5-10분 소요됩니다</span>
              </div>
              <p className="text-center text-blue-600 mt-2 text-sm">
                결과는 이메일로 발송되며, 대시보드에서도 확인하실 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}