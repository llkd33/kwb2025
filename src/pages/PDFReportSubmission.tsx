
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function PDFReportSubmission() {
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const company = localStorage.getItem('currentCompany');
    if (company) {
      const parsedCompany = JSON.parse(company);
      setCurrentCompany(parsedCompany);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type - only PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "파일 형식 오류",
        description: "PDF 파일만 업로드 가능합니다.",
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
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmitPDFReport = async () => {
    if (!selectedFile || !currentCompany) {
      toast({
        title: "파일 선택 필요",
        description: "PDF 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      // 1. Upload PDF to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `report-${currentCompany.id}-${Date.now()}.${fileExt}`;
      const filePath = `${currentCompany.id}/${fileName}`;

      setUploadProgress(25);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('pdf-uploads')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // 2. Create a direct report review request (bypass matching request)
      const { data: newRequest, error: requestError } = await supabase
        .from('matching_requests')
        .insert({
          company_id: currentCompany.id,
          target_countries: ['분석 대상'], // Placeholder since it's required
          company_description: 'PDF 리포트 직접 제출',
          workflow_status: 'documents_uploaded', // Start with documents uploaded
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      setUploadProgress(75);

      // 3. Create PDF upload record
      const { error: pdfRecordError } = await supabase
        .from('pdf_uploads')
        .insert({
          matching_request_id: newRequest.id,
          file_url: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          metadata: {
            upload_type: 'direct_report',
            original_name: selectedFile.name
          }
        });

      if (pdfRecordError) throw pdfRecordError;

      setUploadProgress(90);

      // 4. Trigger PDF processing
      const { error: processError } = await supabase.functions.invoke('process-pdf-report', {
        body: {
          matchingRequestId: newRequest.id,
          pdfUrl: filePath
        }
      });

      if (processError) {
        console.error('PDF processing error:', processError);
        // Update status to indicate processing failed but submission succeeded
        await supabase
          .from('matching_requests')
          .update({ 
            workflow_status: 'admin_review',
            ai_analysis: { 
              error: 'AI 분석 실패',
              message: 'PDF가 업로드되었으나 자동 분석에 실패했습니다. 관리자가 직접 검토합니다.'
            }
          })
          .eq('id', newRequest.id);
      }

      setUploadProgress(100);

      toast({
        title: "리포트 제출 완료",
        description: "PDF 리포트가 성공적으로 제출되었습니다. 검토 후 연락드리겠습니다.",
      });

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "제출 실패",
        description: error.message || "리포트 제출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!currentCompany) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>로그인이 필요합니다.</p>
            <Button asChild className="mt-4">
              <a href="/auth">로그인</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF 리포트 제출
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              {currentCompany.company_name}의 사업 리포트를 제출해주세요
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <span className="mt-3 font-semibold text-blue-700">PDF 업로드</span>
                <span className="text-xs text-blue-600 mt-1">현재 단계</span>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-slate-300 mx-4"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-300 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <span className="mt-3 text-slate-500 font-medium">리포트 리뷰</span>
                <span className="text-xs text-slate-400 mt-1">관리자 검토</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-300 mx-4"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-300 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <span className="mt-3 text-slate-500 font-medium">결과 전달</span>
                <span className="text-xs text-slate-400 mt-1">이메일 발송</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Upload Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              PDF 리포트 업로드
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              회사 소개서, 사업 계획서 등 검토받고 싶은 PDF 문서를 업로드해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div {...getRootProps()} className={`border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'hover:border-blue-400'}`}>
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-700 mb-2">여기에 파일을 드롭하세요</p>
              ) : (
                <p className="text-lg font-medium text-slate-700 mb-2">PDF 파일을 선택하거나 드래그하세요</p>
              )}
              <p className="text-sm text-slate-500">최대 50MB, PDF 형식만 지원</p>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{selectedFile.name}</p>
                      <p className="text-sm text-slate-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>업로드 진행중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-900">제출 전 확인사항</p>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>제출된 PDF는 AI 분석 및 전문가 검토를 거칩니다</li>
                    <li>검토 완료까지 1-2 영업일이 소요됩니다</li>
                    <li>결과는 이메일로 발송됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitPDFReport}
                disabled={!selectedFile || submitting}
                className="min-w-[150px]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    제출 중...
                  </>
                ) : (
                  <>
                    리포트 제출
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
