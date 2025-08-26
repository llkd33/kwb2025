import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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

  useEffect(() => {
    const fetchRows = async () => {
      try {
        // Fetch matching requests without embedding to avoid ambiguous relationship error
        const { data: requestsData, error: requestsError } = await supabase
          .from("matching_requests")
          .select("id, status, created_at, company_id, target_countries")
          .order("created_at", { ascending: false })
          .limit(50);
        
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
        
        setRows(mergedData as Row[]);
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
                <TableHead>Targets</TableHead>
                <TableHead>Report</TableHead>
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
                  <TableCell>{r.target_countries?.join(", ")}</TableCell>
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

