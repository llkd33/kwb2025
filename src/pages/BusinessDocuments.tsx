import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BusinessDocumentUploader } from "@/components/ui/business-document-uploader";
import { FileText, Calendar, CheckCircle, AlertCircle, Download, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface BusinessRegistration {
  id: number;
  document_url: string;
  document_name: string;
  file_size: number;
  uploaded_at: string;
  is_verified: boolean;
  verification_notes?: string;
}

type CompanyMin = { id: number; company_name: string };

export default function BusinessDocuments() {
  const [documents, setDocuments] = useState<BusinessRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyMin | null>(null);
  const { toast } = useToast();
  const { user, session } = useAuth();

  useEffect(() => {
    const loadCompany = async () => {
      if (!session || !user?.email) {
        setCompany(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('companies')
        .select('id, company_name, email')
        .eq('email', user.email)
        .single();
      if (error) {
        toast({ title: '회사 정보 로드 실패', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      setCompany({ id: data.id, company_name: data.company_name });
      await fetchDocuments(data.id);
    };
    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, user?.email]);

  const fetchDocuments = async (companyId: number) => {
    try {
      const { data, error } = await supabase
        .from('business_registration')
        .select('*')
        .eq('company_id', companyId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "문서 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: number, documentUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = documentUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // companyId/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('business-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('business_registration')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "삭제 완료",
        description: "문서가 삭제되었습니다.",
      });

      if (company) await fetchDocuments(company.id);
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (documentUrl: string, fileName: string) => {
    try {
      // Extract file path from URL
      const urlParts = documentUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      const { data, error } = await supabase.storage
        .from('business-documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "다운로드 완료",
        description: "파일이 다운로드되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> 로딩 중...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="text-center py-10">
            <p>회사 정보를 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">사업자등록증 관리</h1>
        <p className="text-gray-600 mt-2">{company.company_name}</p>
      </div>

      {/* Upload Section */}
      <BusinessDocumentUploader 
        companyId={company.id}
        onUploadComplete={() => fetchDocuments(company.id)}
      />

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>업로드된 문서</CardTitle>
          <CardDescription>
            업로드된 사업자등록증 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>업로드된 문서가 없습니다.</p>
              <p className="text-sm">위에서 사업자등록증을 업로드해주세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{doc.document_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                        <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.is_verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        검증완료
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        검증대기
                      </Badge>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.document_url, doc.document_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.document_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {documents.some(doc => doc.verification_notes) && (
        <Card>
          <CardHeader>
            <CardTitle>검증 피드백</CardTitle>
          </CardHeader>
          <CardContent>
            {documents
              .filter(doc => doc.verification_notes)
              .map((doc) => (
                <div key={doc.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3">
                  <p className="font-medium">{doc.document_name}</p>
                  <p className="text-sm text-yellow-800 mt-1">{doc.verification_notes}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
