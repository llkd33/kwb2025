import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type MD = Database["public"]["Tables"]["market_data"]["Row"];

export default function AdminMarketData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MD[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const { data, error } = await supabase
          .from("market_data")
          .select("id, data_category, country, industry, is_active, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setRows((data as MD[]) || []);
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
        <CardTitle>Market Data</CardTitle>
        <CardDescription>Uploaded datasets and status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading market data...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="text-muted-foreground">No market data found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.data_category}</TableCell>
                  <TableCell>{r.country ?? "—"}</TableCell>
                  <TableCell>{r.industry ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? "default" : "secondary"}>
                      {r.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(r.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

