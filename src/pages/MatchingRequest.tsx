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
  "미국", "중국", "일본", "독일", "영국", "프랑스", "이탈리아", "캐나다", "한국", "스페인",
  "호주", "네덜란드", "러시아", "스위스", "벨기에", "아일랜드", "이스라엘", "노르웨이", "오스트리아", "덴마크",
  "싱가포르", "홍콩", "뉴질랜드", "스웨덴", "폴란드", "터키", "태국", "말레이시아", "인도네시아", "베트남",
  "인도", "브라질", "멕시코", "칠레", "아르헨티나", "남아프리카공화국", "이집트", "나이지리아", "케냐", "UAE"
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
      const { error } = await supabase
        .from('matching_requests')
        .insert({
          company_id: currentCompany.id,
          target_countries: selectedCountries,
          company_description: companyDescription,
          additional_questions: additionalQuestions,
          product_info: productInfo,
          market_info: marketInfo,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "매칭 요청 완료",
        description: "AI 분석이 시작됩니다. 결과는 이메일로 알려드리겠습니다.",
      });

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
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">매칭 요청</h1>
        <p className="text-gray-600 mt-2">
          AI 기반 해외진출 분석을 시작합니다 - {currentCompany.company_name}
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="ml-2 font-medium">기본 정보</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="ml-2 text-gray-500">AI 분석</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="ml-2 text-gray-500">결과 확인</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            진출 희망 국가 선택
          </CardTitle>
          <CardDescription>
            해외진출을 희망하는 국가를 선택해주세요. (복수 선택 가능)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {COUNTRIES.map((country) => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={country}
                  checked={selectedCountries.includes(country)}
                  onCheckedChange={() => handleCountryToggle(country)}
                />
                <Label htmlFor={country} className="text-sm cursor-pointer">
                  {country}
                </Label>
              </div>
            ))}
          </div>
          {selectedCountries.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                선택된 국가 ({selectedCountries.length}개):
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedCountries.join(', ')}
              </p>
            </div>
          )}
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

      {/* Submit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI 분석 요청
          </CardTitle>
          <CardDescription>
            모든 정보를 확인한 후 AI 분석을 시작합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-2">분석 내용:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• GPT-4 기반 종합 기업 분석</li>
              <li>• Perplexity AI를 통한 실시간 시장 동향 분석</li>
              <li>• 관리자 제공 시장 데이터와의 교차 분석</li>
              <li>• 진출 전략 및 리스크 분석</li>
              <li>• 맞춤형 파트너 및 투자자 매칭 추천</li>
            </ul>
          </div>

          <Button 
            onClick={handleSubmitRequest}
            disabled={submitting || selectedCountries.length === 0}
            className="w-full"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            {submitting ? "분석 요청 중..." : "AI 분석 시작하기"}
          </Button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            분석 완료까지 약 5-10분 소요되며, 결과는 이메일로 발송됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}