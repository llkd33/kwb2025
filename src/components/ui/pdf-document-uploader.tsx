import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface PDFDocumentUploaderProps {
  matchingRequestId: number;
  onUploadComplete?: () => void;
}

export function PDFDocumentUploader({ matchingRequestId, onUploadComplete }: PDFDocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("company_profile");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "파일 형식 오류",
        description: "PDF, DOC, DOCX, PPT, PPTX 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "파일 크기 오류",
        description: "파일 크기는 50MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "파일 선택 필요",
        description: "업로드할 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${documentType}.${fileExt}`;
      const filePath = `matching-requests/${matchingRequestId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pdf-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-documents')
        .getPublicUrl(filePath);

      setUploadProgress(75);

      // Save file info to pdf_uploads table
      const { error: dbError } = await supabase
        .from('pdf_uploads')
        .insert({
          matching_request_id: matchingRequestId,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          metadata: {
            document_type: documentType,
            uploaded_at: new Date().toISOString()
          }
        });

      if (dbError) throw dbError;

      // Update matching request status
      await supabase
        .from('matching_requests')
        .update({ 
          workflow_status: 'documents_uploaded',
          status: 'processing' 
        })
        .eq('id', matchingRequestId);

      setUploadProgress(100);

      toast({
        title: "업로드 완료",
        description: "문서가 성공적으로 업로드되었습니다. AI 분석이 시작됩니다.",
      });

      // Trigger AI analysis
      const { error: functionError } = await supabase.functions.invoke('process-pdf-report', {
        body: { 
          matchingRequestId,
          pdfUrl: publicUrl
        }
      });

      if (functionError) {
        console.error('AI 분석 시작 실패:', functionError);
        toast({
          title: "주의",
          description: "문서는 업로드되었지만 AI 분석 시작에 실패했습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
      }

      // Reset form
      setSelectedFile(null);
      const fileInput = document.getElementById('pdf-document') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadComplete?.();

    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          비즈니스 문서 업로드
        </CardTitle>
        <CardDescription>
          회사 소개서, 제품 카탈로그 등을 업로드하면 AI가 분석하여 최적의 파트너를 매칭해드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">문서 유형</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="문서 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company_profile">회사 소개서</SelectItem>
              <SelectItem value="product_catalog">제품/서비스 카탈로그</SelectItem>
              <SelectItem value="business_plan">사업 계획서</SelectItem>
              <SelectItem value="financial_report">재무 보고서</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pdf-document">파일 선택</Label>
          <Input
            id="pdf-document"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm">{selectedFile.name}</span>
            <span className="text-xs text-gray-500">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>업로드 중...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "업로드 중..." : "업로드 및 AI 분석 시작"}
        </Button>

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-4 w-4" />
            AI 분석 프로세스
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>문서 업로드 후 AI가 자동으로 분석을 시작합니다</li>
            <li>GPT-4와 Perplexity가 시장 조사 및 매칭 분석을 수행합니다</li>
            <li>관리자가 리포트를 검토하고 최종 승인합니다</li>
            <li>승인된 리포트를 이메일로 받아보실 수 있습니다</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}