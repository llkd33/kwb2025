import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Users, Send, Eye, Save, Calendar, FileText } from "lucide-react";

interface Company {
  id: number;
  email: string;
  company_name: string;
  ceo_name: string;
  is_approved: boolean;
}

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newsletter, setNewsletter] = useState({
    subject: "",
    content: "",
    recipients: "approved_only" // approved_only, all, custom
  });
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, email, company_name, ceo_name, is_approved')
        .order('company_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "회원사 목록 로드 실패",
        description: "회원사 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipients = () => {
    switch (newsletter.recipients) {
      case 'approved_only':
        return companies.filter(c => c.is_approved);
      case 'all':
        return companies;
      case 'custom':
        return companies.filter(c => selectedCompanies.includes(c.id));
      default:
        return [];
    }
  };

  const handleSendNewsletter = async () => {
    setSending(true);
    try {
      const recipients = getRecipients();
      
      if (recipients.length === 0) {
        toast({
          title: "수신자 없음",
          description: "뉴스레터를 받을 수신자가 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // Call edge function to send newsletter
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: newsletter.subject,
          content: newsletter.content,
          recipients: recipients.map(r => ({
            email: r.email,
            company_name: r.company_name,
            ceo_name: r.ceo_name
          }))
        }
      });

      if (error) throw error;

      toast({
        title: "뉴스레터 발송 완료",
        description: `${recipients.length}개 회원사에 뉴스레터가 발송되었습니다.`,
      });

      // Reset form
      setNewsletter({
        subject: "",
        content: "",
        recipients: "approved_only"
      });
      setSelectedCompanies([]);
      setConfirmSendOpen(false);

    } catch (error: any) {
      console.error('Newsletter send error:', error);
      toast({
        title: "뉴스레터 발송 실패",
        description: error.message || "뉴스레터 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCompanySelect = (companyId: number, selected: boolean) => {
    if (selected) {
      setSelectedCompanies([...selectedCompanies, companyId]);
    } else {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    }
  };

  const getEmailTemplate = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${newsletter.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌏 KnowWhere Bridge</h1>
            <p>글로벌 비즈니스 매칭 플랫폼</p>
        </div>
        <div class="content">
            <h2>안녕하세요, {{company_name}} {{ceo_name}} 대표님!</h2>
            <div style="white-space: pre-line;">${newsletter.content}</div>
        </div>
        <div class="footer">
            <p>© 2024 KnowWhere Bridge. All rights reserved.</p>
            <p>이 이메일은 KnowWhere Bridge 회원사에게 발송되는 뉴스레터입니다.</p>
        </div>
    </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  const recipients = getRecipients();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">뉴스레터 발송</h1>
        <p className="text-muted-foreground">
          회원사들에게 뉴스레터를 발송합니다. 모든 수신자는 서로의 이메일을 볼 수 없습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Newsletter Compose */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                뉴스레터 작성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">제목</Label>
                <Input
                  id="subject"
                  value={newsletter.subject}
                  onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                  placeholder="뉴스레터 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={newsletter.content}
                  onChange={(e) => setNewsletter({ ...newsletter, content: e.target.value })}
                  rows={12}
                  placeholder="뉴스레터 내용을 입력하세요. 회사명과 대표명은 자동으로 개인화됩니다."
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>수신자 설정</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipients"
                      value="approved_only"
                      checked={newsletter.recipients === "approved_only"}
                      onChange={(e) => setNewsletter({ ...newsletter, recipients: e.target.value })}
                    />
                    <span>승인된 회원사만 ({companies.filter(c => c.is_approved).length}개)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipients"
                      value="all"
                      checked={newsletter.recipients === "all"}
                      onChange={(e) => setNewsletter({ ...newsletter, recipients: e.target.value })}
                    />
                    <span>모든 회원사 ({companies.length}개)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipients"
                      value="custom"
                      checked={newsletter.recipients === "custom"}
                      onChange={(e) => setNewsletter({ ...newsletter, recipients: e.target.value })}
                    />
                    <span>직접 선택 ({selectedCompanies.length}개 선택됨)</span>
                  </label>
                </div>
              </div>

              {newsletter.recipients === "custom" && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <label key={company.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => handleCompanySelect(company.id, e.target.checked)}
                        />
                        <span className="flex-1">{company.company_name}</span>
                        <Badge variant={company.is_approved ? "default" : "secondary"}>
                          {company.is_approved ? "승인" : "미승인"}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!newsletter.subject || !newsletter.content}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  미리보기
                </Button>
                <Button
                  onClick={() => setConfirmSendOpen(true)}
                  disabled={!newsletter.subject || !newsletter.content || recipients.length === 0}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  발송하기 ({recipients.length}개 회사)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                수신자 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>전체 회원사</span>
                  <Badge variant="outline">{companies.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>승인된 회원사</span>
                  <Badge variant="default">{companies.filter(c => c.is_approved).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>발송 대상</span>
                  <Badge variant="secondary">{recipients.length}</Badge>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">발송 대상 목록</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {recipients.map((company) => (
                      <div key={company.id} className="text-sm flex justify-between items-center">
                        <span>{company.company_name}</span>
                        <Badge variant={company.is_approved ? "default" : "secondary"} className="text-xs">
                          {company.is_approved ? "승인" : "미승인"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>뉴스레터 미리보기</DialogTitle>
            <DialogDescription>
              실제 발송될 이메일의 모습입니다. (예시: {recipients[0]?.company_name || "회사명"})
            </DialogDescription>
          </DialogHeader>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: getEmailTemplate()
                .replace(/{{company_name}}/g, recipients[0]?.company_name || "회사명")
                .replace(/{{ceo_name}}/g, recipients[0]?.ceo_name || "대표명")
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Send Dialog */}
      <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>뉴스레터 발송 확인</DialogTitle>
            <DialogDescription>
              다음 설정으로 뉴스레터를 발송하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div><strong>제목:</strong> {newsletter.subject}</div>
            <div><strong>수신자:</strong> {recipients.length}개 회사</div>
            <div><strong>발송 방식:</strong> 개별 발송 (수신자간 이메일 비공개)</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSendOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSendNewsletter} disabled={sending}>
              {sending ? "발송 중..." : "발송하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}