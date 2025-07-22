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

export default function Admin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [prompts, setPrompts] = useState<GPTPrompt[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<GPTPrompt | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

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
        title: "데이터 로드 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <p className="text-gray-600 mt-2">기업 회원가입 승인 관리</p>
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
          <TabsTrigger value="prompts">AI 프롬프트</TabsTrigger>
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
      </Tabs>

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
    </div>
  );
}