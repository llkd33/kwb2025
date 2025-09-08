import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, FileText } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type MR = Database["public"]["Tables"]["matching_requests"]["Row"];

type Row = MR & {
  companies: { company_name: string } | null;
};

export default function AdminMatchingRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [offset, setOffset] = useState(0);
  const pageSize = 50;
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const fetchRows = async (append = false) => {
      try {
        // Fetch matching requests without embedding to avoid ambiguous relationship error
        const { data: requestsData, error: requestsError } = await supabase
          .from("matching_requests")
          .select("id, status, workflow_status, created_at, company_id, target_countries")
          .order("created_at", { ascending: false })
          .range(append ? offset : 0, (append ? offset : 0) + pageSize - 1);
        
        if (requestsError) throw requestsError;
        
        if (!requestsData || requestsData.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }

        // Get unique company IDs
        const companyIds = Array.from(new Set(requestsData.map(r => r.company_id).filter(Boolean)));
        
        // Fetch company names separately
        let companyMap: Record<number, { company_name: string }> = {};
        if (companyIds.length > 0) {
          const { data: companiesData } = await supabase
            .from('companies')
            .select('id, company_name')
            .in('id', companyIds as number[]);
          
          if (companiesData) {
            for (const company of companiesData) {
              companyMap[company.id] = { company_name: company.company_name };
            }
          }
        }

        // Merge the data
        const mergedData = requestsData.map(request => ({
          ...request,
          companies: companyMap[request.company_id] || null
        }));
        
        setRows(append ? [...rows, ...(mergedData as Row[])] : (mergedData as Row[]));
        if (requestsData.length > 0) {
          setOffset((append ? offset : 0) + requestsData.length);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchRows(false);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      // Delete the matching request (cascade will handle related tables)
      const { error: deleteError } = await supabase
        .from('matching_requests')
        .delete()
        .eq('id', deleteTarget.id);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "리포트 삭제 완료",
        description: `${deleteTarget.companies?.company_name || 'Unknown'}의 리포트가 삭제되었습니다.`,
      });
      
      // Refresh the list
      await fetchRows();
      setDeleteDialog(false);
      setDeleteTarget(null);
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message || "리포트 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Requests</CardTitle>
        <CardDescription>Recent submissions and their statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading matching requests...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="text-muted-foreground">No matching requests yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Targets</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.companies?.company_name ?? "—"}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "completed" ? "default" : r.status === "in-progress" ? "secondary" : "outline"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={['admin_approved','completed','gpt_completed','perplexity_completed'].includes((r as any).workflow_status || '') ? 'default' : 'secondary'}>
                      {(r as any).workflow_status || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.target_countries?.join(", ")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/report/${r.id}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          보기
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeleteTarget(r);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {!loading && rows.length > 0 && (
        <div className="px-6 pb-6">
          <Button variant="outline" onClick={() => fetchRows(true)} disabled={loadingMore}>
            {loadingMore ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</>) : 'Load more'}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리포트 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 {deleteTarget?.companies?.company_name || 'this company'}의 리포트를 삭제하시겠습니까?
              <br />
              <span className="text-destructive font-semibold">
                이 작업은 되돌릴 수 없으며, 관련된 모든 데이터(PDF, AI 분석 결과 등)가 함께 삭제됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false);
                setDeleteTarget(null);
              }}
              disabled={deleteLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
