import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type MR = Database["public"]["Tables"]["matching_requests"]["Row"];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MR[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const { data, error } = await supabase
          .from("matching_requests")
          .select("id, created_at, status, published_at, is_published")
          .order("published_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        setRows((data as MR[]) || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Published and draft reports</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading reports...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="text-muted-foreground">No reports found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>{r.is_published ? new Date(r.published_at || r.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <Link className="text-primary underline" to={`/admin/report/${r.id}`}>Open</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

