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
  is_admin?: boolean;
  created_at: string;
  rejection_reason?: string | null;
};

export default function AdminCompanies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, email, is_approved, is_admin, created_at, rejection_reason")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (company: Company) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          rejection_reason: null 
        })
        .eq('id', company.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('companies')
        .update({ 
          is_approved: false,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.company_name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    {c.is_approved === true && (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    )}
                    {c.is_approved === false && c.rejection_reason && (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                    {(c.is_approved === false || c.is_approved === null) && !c.rejection_reason && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_admin ? "default" : "secondary"}>
                      {c.is_admin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {!c.is_admin && (c.is_approved === false || c.is_approved === null) && !c.rejection_reason && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(c)}
                          disabled={actionLoading}
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
    </Card>
  );
}

