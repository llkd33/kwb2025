import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    company_name: "",
    ceo_name: "",
    manager_name: "",
    manager_position: "",
    phone_number: "",
    industry: "",
    headquarters_country: "",
    headquarters_city: "",
    founding_year: "",
    employee_count: "",
    revenue_scale: "",
    main_products: "",
    target_market: "",
    competitive_advantage: "",
    company_vision: "",
    website: ""
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if company exists and is approved
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('email', loginForm.email)
        .single();

      if (companyError || !company) {
        toast({
          title: "로그인 실패",
          description: "등록되지 않은 이메일입니다.",
          variant: "destructive",
        });
        return;
      }

      if (!company.is_approved) {
        toast({
          title: "승인 대기 중",
          description: "아직 관리자 승인이 완료되지 않았습니다. 승인 완료 후 이메일로 알려드리겠습니다.",
          variant: "destructive",
        });
        return;
      }

      // Check password (in production, this should be hashed)
      if (company.password !== loginForm.password) {
        toast({
          title: "로그인 실패",
          description: "비밀번호가 올바르지 않습니다.",
          variant: "destructive",
        });
        return;
      }

      // Store company session (temporary solution)
      localStorage.setItem('currentCompany', JSON.stringify(company));
      
      toast({
        title: "로그인 성공",
        description: `${company.company_name}님, 환영합니다!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "로그인 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadBusinessDocument = async (companyId: number) => {
    if (!businessDocument) return null;

    const fileExt = businessDocument.name.split('.').pop();
    const fileName = `${companyId}_business_registration_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('business-documents')
      .upload(fileName, businessDocument);

    if (error) throw error;
    return data.path;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessDocument) {
      toast({
        title: "사업자등록증 필요",
        description: "사업자등록증을 업로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('email')
        .eq('email', signupForm.email)
        .single();

      if (existingCompany) {
        toast({
          title: "회원가입 실패",
          description: "이미 사용 중인 이메일입니다.",
          variant: "destructive",
        });
        return;
      }

      // Create new company record
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert({
          ...signupForm,
          founding_year: signupForm.founding_year ? parseInt(signupForm.founding_year) : null,
          is_approved: false,
          is_admin: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Upload business document
      const documentPath = await uploadBusinessDocument(newCompany.id);
      
      // Save business document record
      await supabase
        .from('business_registration')
        .insert({
          company_id: newCompany.id,
          document_url: documentPath,
          document_name: businessDocument.name,
          file_size: businessDocument.size
        });

      // Reset form
      setSignupForm({
        email: "",
        password: "",
        company_name: "",
        ceo_name: "",
        manager_name: "",
        manager_position: "",
        phone_number: "",
        industry: "",
        headquarters_country: "",
        headquarters_city: "",
        founding_year: "",
        employee_count: "",
        revenue_scale: "",
        main_products: "",
        target_market: "",
        competitive_advantage: "",
        company_vision: "",
        website: ""
      });
      setBusinessDocument(null);

      // Show approval dialog
      setShowApprovalDialog(true);

    } catch (error: any) {
      toast({
        title: "회원가입 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NowhereMatching
          </CardTitle>
          <CardDescription>
            해외진출 매칭 플랫폼에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="company@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호 *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">회사명 *</Label>
                    <Input
                      id="company_name"
                      value={signupForm.company_name}
                      onChange={(e) => setSignupForm({ ...signupForm, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ceo_name">대표자명 *</Label>
                    <Input
                      id="ceo_name"
                      value={signupForm.ceo_name}
                      onChange={(e) => setSignupForm({ ...signupForm, ceo_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager_name">담당자명 *</Label>
                    <Input
                      id="manager_name"
                      value={signupForm.manager_name}
                      onChange={(e) => setSignupForm({ ...signupForm, manager_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager_position">담당자 직책 *</Label>
                    <Input
                      id="manager_position"
                      value={signupForm.manager_position}
                      onChange={(e) => setSignupForm({ ...signupForm, manager_position: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">연락처 *</Label>
                    <Input
                      id="phone_number"
                      value={signupForm.phone_number}
                      onChange={(e) => setSignupForm({ ...signupForm, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">업종 *</Label>
                    <Select value={signupForm.industry} onValueChange={(value) => setSignupForm({ ...signupForm, industry: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="업종 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="제조업">제조업</SelectItem>
                        <SelectItem value="IT/소프트웨어">IT/소프트웨어</SelectItem>
                        <SelectItem value="바이오/헬스케어">바이오/헬스케어</SelectItem>
                        <SelectItem value="화학">화학</SelectItem>
                        <SelectItem value="식품">식품</SelectItem>
                        <SelectItem value="패션/뷰티">패션/뷰티</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters_country">본사 국가 *</Label>
                    <Select value={signupForm.headquarters_country} onValueChange={(value) => setSignupForm({ ...signupForm, headquarters_country: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="국가 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="한국">한국</SelectItem>
                        <SelectItem value="일본">일본</SelectItem>
                        <SelectItem value="싱가포르">싱가포르</SelectItem>
                        <SelectItem value="대만">대만</SelectItem>
                        <SelectItem value="홍콩">홍콩</SelectItem>
                        <SelectItem value="필리핀">필리핀</SelectItem>
                        <SelectItem value="인도네시아">인도네시아</SelectItem>
                        <SelectItem value="말레이시아">말레이시아</SelectItem>
                        <SelectItem value="베트남">베트남</SelectItem>
                        <SelectItem value="태국">태국</SelectItem>
                        <SelectItem value="인도">인도</SelectItem>
                        <SelectItem value="기타 아시아">기타 아시아</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="사우디아라비아">사우디아라비아</SelectItem>
                        <SelectItem value="기타 중동">기타 중동</SelectItem>
                        <SelectItem value="미국">미국</SelectItem>
                        <SelectItem value="캐나다">캐나다</SelectItem>
                        <SelectItem value="기타 북미">기타 북미</SelectItem>
                        <SelectItem value="독일">독일</SelectItem>
                        <SelectItem value="영국">영국</SelectItem>
                        <SelectItem value="프랑스">프랑스</SelectItem>
                        <SelectItem value="이탈리아">이탈리아</SelectItem>
                        <SelectItem value="스페인">스페인</SelectItem>
                        <SelectItem value="네덜란드">네덜란드</SelectItem>
                        <SelectItem value="기타 유럽">기타 유럽</SelectItem>
                        <SelectItem value="호주">호주</SelectItem>
                        <SelectItem value="뉴질랜드">뉴질랜드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters_city">본사 도시</Label>
                    <Input
                      id="headquarters_city"
                      value={signupForm.headquarters_city}
                      onChange={(e) => setSignupForm({ ...signupForm, headquarters_city: e.target.value })}
                      placeholder="서울"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founding_year">설립연도</Label>
                    <Input
                      id="founding_year"
                      type="number"
                      value={signupForm.founding_year}
                      onChange={(e) => setSignupForm({ ...signupForm, founding_year: e.target.value })}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_count">직원 수</Label>
                    <Select value={signupForm.employee_count} onValueChange={(value) => setSignupForm({ ...signupForm, employee_count: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="직원 수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10명">1-10명</SelectItem>
                        <SelectItem value="11-50명">11-50명</SelectItem>
                        <SelectItem value="51-100명">51-100명</SelectItem>
                        <SelectItem value="101-500명">101-500명</SelectItem>
                        <SelectItem value="500명 이상">500명 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">회사 웹사이트</Label>
                  <Input
                    id="website"
                    type="url"
                    value={signupForm.website}
                    onChange={(e) => setSignupForm({ ...signupForm, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="main_products">주요 제품/서비스</Label>
                  <Textarea
                    id="main_products"
                    value={signupForm.main_products}
                    onChange={(e) => setSignupForm({ ...signupForm, main_products: e.target.value })}
                    placeholder="회사의 주요 제품이나 서비스를 간단히 설명해주세요"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target_market">타겟 시장</Label>
                  <Textarea
                    id="target_market"
                    value={signupForm.target_market}
                    onChange={(e) => setSignupForm({ ...signupForm, target_market: e.target.value })}
                    placeholder="진출하고자 하는 해외 시장을 설명해주세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_document">사업자등록증 *</Label>
                  <Input
                    id="business_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setBusinessDocument(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    PDF, JPG, PNG 파일만 업로드 가능합니다.
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "회원가입 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원가입 완료</DialogTitle>
            <DialogDescription>
              회원가입이 완료되었습니다. 관리자 승인 후 이메일로 알려드리겠습니다.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            setShowApprovalDialog(false);
            navigate('/');
          }}>
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}