import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Report {
  id: number;
  status: string;
  workflow_status: string;
  created_at: string;
  company_name: string;
}

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      // Fetch matching requests without embedding companies to avoid ambiguous relationship error
      const { data: requestsData, error: requestsError } = await supabase
        .from('matching_requests')
        .select('id, status, workflow_status, created_at, company_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (requestsError) {
        setError(requestsError.message);
        setLoading(false);
        return;
      }

      if (!requestsData || requestsData.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get unique company IDs
      const companyIds = Array.from(new Set(requestsData.map(r => r.company_id).filter(Boolean)));
      
      // Fetch company names separately
      let companyMap: Record<number, string> = {};
      if (companyIds.length > 0) {
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, company_name')
          .in('id', companyIds as number[]);
        
        if (companiesData) {
          for (const company of companiesData) {
            companyMap[company.id] = company.company_name;
          }
        }
      }

      // Merge the data
      const formattedData: Report[] = requestsData.map((report) => ({
        id: report.id,
        status: report.status,
        workflow_status: report.workflow_status,
        created_at: new Date(report.created_at).toLocaleDateString(),
        company_name: companyMap[report.company_id] || '—',
      }));
      
      setReports(formattedData);
      setLoading(false);
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-muted-foreground">No recent matching requests.</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Workflow Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{report.company_name}</TableCell>
            <TableCell>{report.created_at}</TableCell>
            <TableCell>
              <Badge variant={report.status === 'completed' ? 'default' : report.status === 'in-progress' ? 'secondary' : 'destructive'}>
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={report.workflow_status === 'done' ? 'default' : report.workflow_status === 'pending' ? 'secondary' : 'destructive'}>
                {report.workflow_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Dashboard;
