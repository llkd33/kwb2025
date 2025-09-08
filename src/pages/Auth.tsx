import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { t } = useLanguage();
  const { signIn, signUp, user, session } = useAuth();
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
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated - debounced to prevent flickering
  useEffect(() => {
    let cancelled = false;
    const maybeRedirectIfReady = async () => {
      if (!(session && user) || isLoading) return;

      // Ensure company profile exists in localStorage; if not, fetch and cache it
      const storedCompany = localStorage.getItem('currentCompany');
      if (!storedCompany) {
        try {
          const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('email', user.email as string)
            .maybeSingle();
          if (error) throw error;
          if (company && !cancelled) {
            localStorage.setItem('currentCompany', JSON.stringify(company));
          } else {
            // No company profile; stay on auth without redirect
            return;
          }
        } catch (_) {
          return;
        }
      }

      if (!cancelled) {
        navigate(from, { replace: true });
      }
    };
    maybeRedirectIfReady();
    return () => { cancelled = true; };
  }, [session, user, isLoading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(loginForm.email, loginForm.password);

      // Get company data from localStorage (already stored in AuthContext)
      const storedCompany = localStorage.getItem('currentCompany');
      const company = storedCompany ? JSON.parse(storedCompany) : null;

      // Navigate based on admin status
      if (company?.is_admin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      // Errors and toasts handled in AuthContext.signIn
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
        title: t('auth.errors.document_required'),
        description: t('auth.errors.document_required_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1) Create auth user + company without email confirmation via Edge Function
      const { data: signupResp, error: fnError } = await supabase.functions.invoke('signup-no-confirm', {
        body: {
          email: signupForm.email,
          password: signupForm.password,
          company_name: signupForm.company_name,
          ceo_name: signupForm.ceo_name,
          manager_name: signupForm.manager_name,
          manager_position: signupForm.manager_position,
          phone_number: signupForm.phone_number,
          industry: signupForm.industry,
          headquarters_country: signupForm.headquarters_country,
          headquarters_city: signupForm.headquarters_city,
          founding_year: signupForm.founding_year ? parseInt(signupForm.founding_year) : null,
          employee_count: signupForm.employee_count,
          revenue_scale: signupForm.revenue_scale,
          main_products: signupForm.main_products,
          target_market: signupForm.target_market,
          competitive_advantage: signupForm.competitive_advantage,
          company_vision: signupForm.company_vision,
          website: signupForm.website,
        },
      });
      if (fnError) throw fnError;

      const newCompany = signupResp?.company;

      // 2) Sign in the new user (no email confirmation required)
      await signIn(signupForm.email, signupForm.password);

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
        title: t('auth.errors.signup_error'),
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
            {t('auth.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="company@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('auth.loginForm.loading') : t('auth.loginForm.button')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={signupForm.password} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t('company.name')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="company_name"
                      value={signupForm.company_name}
                      onChange={(e) => setSignupForm({ ...signupForm, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ceo_name">대표자 성명 <span className="text-red-500">*</span></Label>
                    <Input
                      id="ceo_name"
                      value={signupForm.ceo_name}
                      onChange={(e) => setSignupForm({ ...signupForm, ceo_name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager_name">{t('company.manager')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="manager_name"
                      value={signupForm.manager_name}
                      onChange={(e) => setSignupForm({ ...signupForm, manager_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager_position">{t('company.position')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="manager_position"
                      value={signupForm.manager_position}
                      onChange={(e) => setSignupForm({ ...signupForm, manager_position: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{t('company.phone')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone_number"
                      value={signupForm.phone_number}
                      onChange={(e) => setSignupForm({ ...signupForm, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">{t('company.industry')} <span className="text-red-500">*</span></Label>
                    <Select value={signupForm.industry} onValueChange={(value) => setSignupForm({ ...signupForm, industry: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="제조업">{t('industry.manufacturing')}</SelectItem>
                        <SelectItem value="IT/소프트웨어">{t('industry.it')}</SelectItem>
                        <SelectItem value="바이오/헬스케어">{t('industry.bio')}</SelectItem>
                        <SelectItem value="화학">{t('industry.chemical')}</SelectItem>
                        <SelectItem value="식품">{t('industry.food')}</SelectItem>
                        <SelectItem value="패션/뷰티">{t('industry.fashion')}</SelectItem>
                        <SelectItem value="기타">{t('industry.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters_country">{t('company.country')} <span className="text-red-500">*</span></Label>
                    <Select value={signupForm.headquarters_country} onValueChange={(value) => setSignupForm({ ...signupForm, headquarters_country: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="한국">{t('country.korea')}</SelectItem>
                        <SelectItem value="일본">{t('country.japan')}</SelectItem>
                        <SelectItem value="싱가포르">{t('country.singapore')}</SelectItem>
                        <SelectItem value="대만">{t('country.taiwan')}</SelectItem>
                        <SelectItem value="홍콩">{t('country.hongkong')}</SelectItem>
                        <SelectItem value="필리핀">{t('country.philippines')}</SelectItem>
                        <SelectItem value="인도네시아">{t('country.indonesia')}</SelectItem>
                        <SelectItem value="말레이시아">{t('country.malaysia')}</SelectItem>
                        <SelectItem value="베트남">{t('country.vietnam')}</SelectItem>
                        <SelectItem value="태국">{t('country.thailand')}</SelectItem>
                        <SelectItem value="인도">{t('country.india')}</SelectItem>
                        <SelectItem value="기타 아시아">{t('country.other.asia')}</SelectItem>
                        <SelectItem value="UAE">{t('country.uae')}</SelectItem>
                        <SelectItem value="사우디아라비아">{t('country.saudi')}</SelectItem>
                        <SelectItem value="기타 중동">{t('country.other.middle')}</SelectItem>
                        <SelectItem value="미국">{t('country.usa')}</SelectItem>
                        <SelectItem value="캐나다">{t('country.canada')}</SelectItem>
                        <SelectItem value="기타 북미">{t('country.other.north')}</SelectItem>
                        <SelectItem value="독일">{t('country.germany')}</SelectItem>
                        <SelectItem value="영국">{t('country.uk')}</SelectItem>
                        <SelectItem value="프랑스">{t('country.france')}</SelectItem>
                        <SelectItem value="이탈리아">{t('country.italy')}</SelectItem>
                        <SelectItem value="스페인">{t('country.spain')}</SelectItem>
                        <SelectItem value="네덜란드">{t('country.netherlands')}</SelectItem>
                        <SelectItem value="기타 유럽">{t('country.other.europe')}</SelectItem>
                        <SelectItem value="호주">{t('country.australia')}</SelectItem>
                        <SelectItem value="뉴질랜드">{t('country.newzealand')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters_city">{t('company.city')}</Label>
                    <Input
                      id="headquarters_city"
                      value={signupForm.headquarters_city}
                      onChange={(e) => setSignupForm({ ...signupForm, headquarters_city: e.target.value })}
                      placeholder="서울"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founding_year">{t('company.year')}</Label>
                    <Input
                      id="founding_year"
                      type="number"
                      value={signupForm.founding_year}
                      onChange={(e) => setSignupForm({ ...signupForm, founding_year: e.target.value })}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_count">{t('company.employees')}</Label>
                    <Select value={signupForm.employee_count} onValueChange={(value) => setSignupForm({ ...signupForm, employee_count: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10명">{t('employees.1-10')}</SelectItem>
                        <SelectItem value="11-50명">{t('employees.11-50')}</SelectItem>
                        <SelectItem value="51-100명">{t('employees.51-100')}</SelectItem>
                        <SelectItem value="101-500명">{t('employees.101-500')}</SelectItem>
                        <SelectItem value="500명 이상">{t('employees.500+')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">{t('company.website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={signupForm.website}
                    onChange={(e) => setSignupForm({ ...signupForm, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="main_products">{t('company.products')}</Label>
                  <Textarea
                    id="main_products"
                    value={signupForm.main_products}
                    onChange={(e) => setSignupForm({ ...signupForm, main_products: e.target.value })}
                    placeholder="회사의 주요 제품이나 서비스를 간단히 설명해주세요"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target_market">{t('company.target')}</Label>
                  <Textarea
                    id="target_market"
                    value={signupForm.target_market}
                    onChange={(e) => setSignupForm({ ...signupForm, target_market: e.target.value })}
                    placeholder="진출하고자 하는 해외 시장을 설명해주세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_document">{t('company.document')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="business_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setBusinessDocument(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('company.documentNote')}
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('auth.signupForm.loading') : t('auth.signupForm.button')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.signupForm.complete')}</DialogTitle>
            <DialogDescription>
              {t('auth.signupForm.completeMessage')}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            setShowApprovalDialog(false);
            navigate('/dashboard');
          }}>
            {t('auth.confirm')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
