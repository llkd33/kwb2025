import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Upload, Download, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExcelUploadProps {
  onDataUploaded: (data: any[], metadata: FileMetadata) => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  sampleTemplateUrl?: string;
}

interface FileMetadata {
  fileName: string;
  sheetCount: number;
  rowCount: number;
  columnCount: number;
  uploadDate: string;
  fileSize: number;
}

interface DataValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function ExcelUpload({
  onDataUploaded,
  acceptedFormats = [".xlsx", ".xls", ".csv"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  sampleTemplateUrl
}: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [validation, setValidation] = useState<DataValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateData = (data: any[]): DataValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if data is empty
    if (data.length === 0) {
      errors.push("파일에 데이터가 없습니다.");
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check for required columns (customize based on your needs)
    const recommendedColumns = ["회사기업명", "홈페이지", "주요솔루션", "경영시현황", "투자유치"];
    const existingColumns = Object.keys(data[0] || {});
    
    recommendedColumns.forEach(col => {
      if (!existingColumns.some(existing => existing.includes(col))) {
        warnings.push(`권장 컬럼 '${col}'이(가) 없습니다.`);
      }
    });

    // Check for empty rows
    const emptyRows = data.filter(row => 
      Object.values(row).every(val => !val || String(val).trim() === "")
    );
    if (emptyRows.length > 0) {
      warnings.push(`${emptyRows.length}개의 빈 행이 발견되었습니다.`);
    }

    // Suggestions based on data
    if (data.length < 5) {
      suggestions.push("더 많은 데이터를 추가하면 분석의 정확도가 향상됩니다.");
    }

    // Check for URL format in website columns
    const urlColumns = existingColumns.filter(col => 
      col.toLowerCase().includes("url") || col.includes("홈페이지") || col.includes("웹사이트")
    );
    urlColumns.forEach(col => {
      const invalidUrls = data.filter(row => {
        const url = row[col];
        return url && !url.toString().match(/^(https?:\/\/|www\.)/i);
      });
      if (invalidUrls.length > 0) {
        warnings.push(`'${col}' 컬럼에 ${invalidUrls.length}개의 잘못된 URL 형식이 있습니다.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: "",
        blankrows: false 
      });
      
      if (jsonData.length < 2) {
        throw new Error("파일에 충분한 데이터가 없습니다.");
      }

      // Extract headers and data
      const headers = (jsonData[0] as any[]).map(h => String(h).trim());
      const rows = jsonData.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });

      // Create metadata
      const meta: FileMetadata = {
        fileName: file.name,
        sheetCount: workbook.SheetNames.length,
        rowCount: rows.length,
        columnCount: headers.length,
        uploadDate: new Date().toISOString(),
        fileSize: file.size
      };

      // Validate data
      const validationResult = validateData(rows);
      
      // Set state
      setColumns(headers);
      setPreviewData(rows.slice(0, 5)); // Preview first 5 rows
      setMetadata(meta);
      setValidation(validationResult);
      
      if (validationResult.isValid || validationResult.errors.length === 0) {
        toast({
          title: "파일 처리 완료",
          description: `${rows.length}개의 데이터 행을 성공적으로 읽었습니다.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "파일 처리 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > maxFileSize) {
        toast({
          title: "파일 크기 초과",
          description: `파일 크기는 ${(maxFileSize / 1024 / 1024).toFixed(0)}MB를 초과할 수 없습니다.`,
          variant: "destructive",
        });
        return;
      }
      
      setFile(file);
      processFile(file);
    }
  }, [maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleUpload = () => {
    if (previewData.length > 0 && metadata && validation?.isValid !== false) {
      onDataUploaded(previewData, metadata);
      toast({
        title: "업로드 성공",
        description: "데이터가 성공적으로 업로드되었습니다.",
      });
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setMetadata(null);
    setValidation(null);
  };

  const downloadSampleTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        "회사기업명": "알케마",
        "홈페이지": "https://www.alchera.ai/",
        "주요솔루션": "인공지능종합 비대면 본인확인 솔루션",
        "대표자명": "신현욱자동차센서, 선한기술, SK증권, 인천창조경제",
        "투자유치(억원)": "100억 원(라시아, 유형, 복만남미 오세아니",
        "onfido": "산업중자동차종합, 행국중장사 강족송첨행해여왕 성남",
        "jumio": "200억 미국관기(라국, 망국시시, 산류호구니",
        "sumsub": "12쿨 (비로서(콜) 50억국미"
      },
      {
        "회사기업명": "큐라멜트",
        "홈페이지": "https://qurement.com/kr/",
        "주요솔루션": "신호증사분만힘솔루션",
        "대표자명": "김트렉터효솔루자(Comtrue)",
        "투자유치(억원)": "루지뮤보",
        "onfido": "시단시",
        "jumio": "idemia",
        "sumsub": "Veridas acount"
      },
      {
        "회사기업명": "코매퍼",
        "홈페이지": "https://komapper.ai/",
        "주요솔루션": "건물 및 교량력 균열감지 및 정촉솔루션",
        "대표자명": "오필테크",
        "투자유치(억원)": "빅이시",
        "onfido": "PIX4D",
        "jumio": "드론로룸터이(한국)",
        "sumsub": ""
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "샘플데이터");

    // Download file
    XLSX.writeFile(wb, "투자유치_기업정보_샘플.xlsx");
    
    toast({
      title: "샘플 파일 다운로드",
      description: "샘플 Excel 파일이 다운로드되었습니다.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel 데이터 업로드
        </CardTitle>
        <CardDescription>
          투자유치 기업 정보, 시장 데이터, 경쟁사 분석 등의 Excel 파일을 업로드하세요
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sample Template Download */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1">권장 데이터 형식</p>
                <p className="text-sm">회사기업명, 홈페이지, 주요솔루션, 대표자명, 투자유치 정보 등을 포함한 Excel 파일</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleTemplate}
                className="ml-4"
              >
                <Download className="h-4 w-4 mr-2" />
                샘플 다운로드
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Upload Area */}
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? "파일을 놓으세요" : "Excel 파일을 드래그하거나 클릭하여 선택"}
            </p>
            <p className="text-sm text-gray-500">
              지원 형식: {acceptedFormats.join(", ")} (최대 {(maxFileSize / 1024 / 1024).toFixed(0)}MB)
            </p>
          </div>
        )}

        {/* File Info & Validation */}
        {file && metadata && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{metadata.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {metadata.rowCount}행 × {metadata.columnCount}열 | {(metadata.fileSize / 1024).toFixed(1)}KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Validation Results */}
            {validation && (
              <div className="space-y-2">
                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">오류</p>
                      <ul className="list-disc list-inside text-sm">
                        {validation.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">경고</p>
                      <ul className="list-disc list-inside text-sm">
                        {validation.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.suggestions.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">제안</p>
                      <ul className="list-disc list-inside text-sm">
                        {validation.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.isValid && validation.warnings.length === 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      데이터 검증 완료: 모든 데이터가 올바른 형식입니다.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Data Preview */}
            {previewData.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">데이터 미리보기 (처음 5행)</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col, i) => (
                          <TableHead key={i} className="min-w-[120px]">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {columns.map((col, colIndex) => (
                            <TableCell key={colIndex} className="max-w-[200px] truncate">
                              {row[col] || "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClear}>
                취소
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!validation || validation.errors.length > 0 || isProcessing}
              >
                {isProcessing ? "처리 중..." : "데이터 업로드"}
              </Button>
            </div>
          </div>
        )}

        {/* Data Format Guide */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📊 권장 데이터 형식 가이드</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div>
              <span className="font-medium">필수 컬럼:</span>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li><code>회사기업명</code> - 회사 또는 기업의 정식 명칭</li>
                <li><code>홈페이지</code> - 회사 웹사이트 URL (https:// 포함)</li>
                <li><code>주요솔루션</code> - 제품/서비스 설명</li>
              </ul>
            </div>
            <div>
              <span className="font-medium">권장 컬럼:</span>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li><code>대표자명</code> - CEO 또는 대표이사 성명</li>
                <li><code>투자유치(억원)</code> - 투자 금액 정보</li>
                <li><code>경영시현황</code> - 현재 경영 상태</li>
                <li><code>산업분야</code> - 비즈니스 도메인</li>
              </ul>
            </div>
            <div>
              <span className="font-medium">팁:</span>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>URL은 전체 주소 포함 (예: https://example.com)</li>
                <li>빈 셀은 자동으로 처리되므로 걱정하지 마세요</li>
                <li>여러 시트가 있는 경우 첫 번째 시트만 읽습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}