import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Mail = Database["public"]["Tables"]["mail_log"]["Row"];

export default function AdminMailLogs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Mail[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const { data, error } = await supabase
          .from("mail_log")
          .select("id, sent_at, recipient_email, subject, delivery_status, error_message")
          .order("sent_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setRows((data as Mail[]) || []);
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
        <CardTitle>Mail Logs</CardTitle>
        <CardDescription>Outgoing email events and delivery status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading mail logs...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="text-muted-foreground">No logs found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent At</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.sent_at).toLocaleString()}</TableCell>
                  <TableCell>{r.recipient_email}</TableCell>
                  <TableCell className="truncate max-w-md" title={r.subject}>{r.subject}</TableCell>
                  <TableCell>
                    <Badge variant={r.delivery_status === 'delivered' ? 'default' : 'secondary'}>
                      {r.delivery_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{r.error_message ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

