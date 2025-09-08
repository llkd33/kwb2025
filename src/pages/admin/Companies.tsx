import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Company = {
  id: number;
  company_name: string;
  email: string;
  is_approved: boolean | null;
  approval_status?: 'pending' | 'approved' | 'rejected';
  is_admin?: boolean;
  created_at: string;
  rejection_reason?: string | null;
};

export default function AdminCompanies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [offset, setOffset] = useState(0);
  const pageSize = 50;
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Business registration documents state
  const [verifiedCount, setVerifiedCount] = useState<Record<number, number>>({});
  const [totalCount, setTotalCount] = useState<Record<number, number>>({});
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalCompany, setDocsModalCompany] = useState<Company | null>(null);
  const [docsList, setDocsList] = useState<Array<{ id: number; document_name: string; document_url: string; uploaded_at: string; is_verified: boolean; verification_notes?: string; signedUrl?: string }>>([]);

  const fetchCompanies = async (append = false) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, email, is_approved, approval_status, is_admin, created_at, rejection_reason")
        .order("created_at", { ascending: false })
        .range(append ? offset : 0, (append ? offset : 0) + pageSize - 1);
      if (error) throw error;
      setCompanies(append ? [...companies, ...(data || [])] : (data || []));
      if (data && data.length > 0) {
        setOffset((append ? offset : 0) + data.length);
      }
      // Fetch aggregated document stats for displayed companies
      const ids = (data || []).map(c => c.id);
      if (ids.length > 0) {
        const { data: docs } = await supabase
          .from('business_registration')
          .select('company_id, is_verified')
          .in('company_id', ids);
        const vCount: Record<number, number> = {};
        const tCount: Record<number, number> = {};
        (docs || []).forEach((d: any) => {
          const cid = d.company_id as number;
          tCount[cid] = (tCount[cid] || 0) + 1;
          if (d.is_verified) vCount[cid] = (vCount[cid] || 0) + 1;
        });
        setVerifiedCount(vCount);
        setTotalCount(tCount);
      } else {
        setVerifiedCount({});
        setTotalCount({});
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(false);
  }, []);

  const handleApprove = async (company: Company) => {
    setActionLoading(true);
    try {
      // Try new schema first; fall back if column missing
      let { error } = await supabase
        .from('companies')
        .update({ 
          is_approved: true,
          approval_status: 'approved' as any,
          approved_at: new Date().toISOString(),
          rejection_reason: null 
        } as any)
        .eq('id', company.id);

      if (error) {
        // Fallback for instances without approval_status column
        const { error: legacyErr } = await supabase
          .from('companies')
          .update({ 
            is_approved: true,
            approved_at: new Date().toISOString(),
            rejection_reason: null 
          } as any)
          .eq('id', company.id);
        if (legacyErr) throw legacyErr;
      }

      // Send approval email via Edge Function
      try {
        await supabase.functions.invoke('send-approval-email', {
          body: { companyId: company.id, type: 'approval' }
        });
      } catch (e) {
        // Non-blocking failure: still consider approval successful
      }

      toast({
        title: "승인 완료",
        description: `${company.company_name}이 승인되었습니다.`,
      });

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
      // Try new schema first; fall back if column missing
      let { error } = await supabase
        .from('companies')
        .update({ 
          is_approved: false,
          approval_status: 'rejected' as any,
          rejection_reason: rejectionReason
        } as any)
        .eq('id', selectedCompany.id);

      if (error) {
        const { error: legacyErr } = await supabase
          .from('companies')
          .update({ 
            is_approved: false,
            rejection_reason: rejectionReason
          } as any)
          .eq('id', selectedCompany.id);
        if (legacyErr) throw legacyErr;
      }

      // Send rejection email via Edge Function
      try {
        await supabase.functions.invoke('send-approval-email', {
          body: { companyId: selectedCompany.id, type: 'rejection', rejectionReason }
        });
      } catch (e) {
        // Non-blocking failure
      }

      toast({
        title: "거부 완료",
        description: `${selectedCompany.company_name}이 거부되었습니다.`,
      });

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

  const openDocsModal = async (company: Company) => {
    setDocsModalCompany(company);
    setDocsModalOpen(true);
    try {
      const { data, error } = await supabase
        .from('business_registration')
        .select('id, document_name, document_url, uploaded_at, is_verified, verification_notes')
        .eq('company_id', company.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      const withSigned: typeof docsList = [];
      for (const row of (data || [])) {
        const rawPath = (row.document_url || '').toString();
        const normalizedPath = rawPath.replace(/^\/?business-documents\//, '').replace(/^\//, '');
        let signedUrl: string | undefined;
        try {
          const { data: signed } = await supabase.storage.from('business-documents').createSignedUrl(normalizedPath, 3600);
          signedUrl = signed?.signedUrl;
        } catch (_) {}
        withSigned.push({ ...row, signedUrl });
      }
      setDocsList(withSigned);
    } catch (e: any) {
      toast({ title: '서류 로드 실패', description: e.message, variant: 'destructive' });
      setDocsList([]);
    }
  };

  const markVerified = async (docId: number) => {
    try {
      const { error } = await supabase
        .from('business_registration')
        .update({ is_verified: true, verified_at: new Date().toISOString() as any })
        .eq('id', docId);
      if (error) throw error;
      if (docsModalCompany) {
        await openDocsModal(docsModalCompany);
        await fetchCompanies();
      }
      toast({ title: '검증 완료', description: '서류가 검증 처리되었습니다.' });
    } catch (e: any) {
      toast({ title: '검증 실패', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
        <CardDescription>Recent company signups and approval state</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading companies...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : companies.length === 0 ? (
          <div className="text-muted-foreground">No companies found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.company_name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = (c.approval_status && c.approval_status !== 'pending')
                        ? c.approval_status
                        : (c.is_approved ? 'approved' : (c.rejection_reason ? 'rejected' : 'pending'));
                      if (status === 'approved') return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
                      if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
                      return <Badge variant="secondary">Pending</Badge>;
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_admin ? "default" : "secondary"}>
                      {c.is_admin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={verifiedCount[c.id] ? 'default' : 'secondary'}>
                      {verifiedCount[c.id] || 0}/{totalCount[c.id] || 0}
                    </Badge>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => openDocsModal(c)}>
                      서류 확인
                    </Button>
                  </TableCell>
                  <TableCell>
                    {!c.is_admin && (c.is_approved === false || c.is_approved === null) && !c.rejection_reason && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(c)}
                          disabled={actionLoading || (verifiedCount[c.id] || 0) === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedCompany(c);
                            setRejectionReason("");
                            setShowRejectDialog(true);
                          }}
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          거부
                        </Button>
                      </div>
                    )}
                    {c.is_approved === false && c.rejection_reason && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(c)}
                        disabled={actionLoading}
                      >
                        재승인
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {!loading && companies.length > 0 && (
        <div className="px-6 pb-6">
          <Button variant="outline" onClick={() => fetchCompanies(true)} disabled={loadingMore}>
            {loadingMore ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</>) : 'Load more'}
          </Button>
        </div>
      )}

      {/* 거부 사유 입력 다이얼로그 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회사 가입 거부</DialogTitle>
            <DialogDescription>
              {selectedCompany?.company_name}의 가입을 거부하시겠습니까? 거부 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="거부 사유를 입력하세요..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedCompany(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              거부
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 사업자등록증 서류 확인 다이얼로그 */}
      <Dialog open={docsModalOpen} onOpenChange={setDocsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>서류 확인 - {docsModalCompany?.company_name}</DialogTitle>
            <DialogDescription>
              업로드된 사업자등록증 목록을 확인하고 검증 처리하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {docsList.length === 0 ? (
              <div className="text-muted-foreground py-6">업로드된 서류가 없습니다.</div>
            ) : (
              docsList.map((d) => {
                const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(d.document_name || d.document_url);
                return (
                  <div key={d.id} className="p-3 border rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium break-all">{d.document_name}</div>
                        <div className="text-xs text-muted-foreground">업로드: {new Date(d.uploaded_at).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground break-all">경로: {d.document_url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.signedUrl && (
                          <a href={d.signedUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">새 창으로 보기</a>
                        )}
                        {d.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">검증완료</Badge>
                        ) : (
                          <Button size="sm" onClick={() => markVerified(d.id)}>검증완료로 표시</Button>
                        )}
                      </div>
                    </div>
                    {d.signedUrl && isImage && (
                      <div className="w-full">
                        <img src={d.signedUrl} alt={d.document_name} className="max-h-64 w-full object-contain rounded border" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocsModalOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
