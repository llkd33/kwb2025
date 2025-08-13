import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Database, FileSpreadsheet, Trash2, RefreshCw } from "lucide-react";
import * as XLSX from 'xlsx';

export default function AdminExcelManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>("partners");
  const exampleTemplates: Record<string, Array<{ key: string; description: string }>> = {
    partners: [
      { key: 'company_name', description: '파트너사 명' },
      { key: 'country', description: '국가코드 또는 국가명 (예: KR, US)' },
      { key: 'industry', description: '산업 카테고리' },
      { key: 'contact', description: '연락 담당자/이메일' },
      { key: 'strengths', description: '강점(콤마 구분 가능)' },
    ],
    countries: [
      { key: 'country', description: '국가코드 또는 국가명' },
      { key: 'market_size', description: '시장규모(숫자 또는 텍스트)' },
      { key: 'cagr', description: '연평균성장률(%)' },
      { key: 'key_regulations', description: '핵심 규제(요약)' },
      { key: 'certifications', description: '필요 인증' },
    ],
    industries: [
      { key: 'industry', description: '산업명' },
      { key: 'sub_sectors', description: '세부 섹터(콤마 구분)' },
      { key: 'key_players', description: '주요 기업(콤마 구분)' },
      { key: 'avg_margin', description: '평균 마진(%)' },
      { key: 'trends', description: '주요 트렌드 요약' },
    ],
  };

  useEffect(() => {
    fetchExcelData();
  }, [dataType]);

  const fetchExcelData = async () => {
    try {
      const { data, error } = await supabase
        .from('excel_reference')
        .select('*')
        .eq('data_type', dataType)
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setExcelData(data || []);
    } catch (error) {
      console.error('Error fetching excel data:', error);
      toast({
        title: "데이터 로드 실패",
        description: "Excel 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "파일 형식 오류",
        description: "Excel 파일(.xlsx, .xls)만 업로드 가능합니다.",
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
        description: "업로드할 Excel 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Read Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Process each sheet
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length > 0) {
              // Deactivate previous version
              await supabase
                .from('excel_reference')
                .update({ is_active: false })
                .eq('data_type', dataType)
                .eq('sheet_name', sheetName);

              // Insert new data
              const { error } = await supabase
                .from('excel_reference')
                .insert({
                  file_name: selectedFile.name,
                  sheet_name: sheetName,
                  data_type: dataType,
                  data_content: jsonData,
                  version: 1,
                  is_active: true
                });

              if (error) throw error;
            }
          }

          toast({
            title: "업로드 완료",
            description: `${selectedFile.name} 파일이 성공적으로 업로드되었습니다.`,
          });

          fetchExcelData();
          setSelectedFile(null);
          const fileInput = document.getElementById('excel-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

        } catch (error) {
          console.error('Excel processing error:', error);
          toast({
            title: "처리 실패",
            description: "Excel 파일 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      };
      reader.readAsBinaryString(selectedFile);

    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 데이터를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('excel_reference')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "데이터가 비활성화되었습니다.",
      });

      fetchExcelData();
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (excelData.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "내보낼 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    excelData.forEach((item) => {
      const ws = XLSX.utils.json_to_sheet(item.data_content);
      XLSX.utils.book_append_sheet(wb, ws, item.sheet_name);
    });

    // Export
    XLSX.writeFile(wb, `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "내보내기 완료",
      description: "Excel 파일이 다운로드되었습니다.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Excel 데이터베이스 관리</h1>
        <p className="text-muted-foreground">
          AI 분석에 참조될 Excel 데이터를 관리합니다. 파트너 정보, 국가별 데이터, 산업 정보 등을 업로드하세요.
        </p>
      </div>

      <Tabs value={dataType} onValueChange={setDataType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partners">
            <Database className="w-4 h-4 mr-2" />
            파트너 정보
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Database className="w-4 h-4 mr-2" />
            국가별 데이터
          </TabsTrigger>
          <TabsTrigger value="industries">
            <Database className="w-4 h-4 mr-2" />
            산업 정보
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          {/* Example Template Guidance */}
          <Card>
            <CardHeader>
              <CardTitle>예시 템플릿 가이드</CardTitle>
              <CardDescription>
                선택한 탭에 맞춰 Excel 시트에 다음 컬럼을 포함하는 것을 권장합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">컬럼 키</TableHead>
                      <TableHead className="whitespace-nowrap">설명</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(exampleTemplates[dataType] || []).map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{row.key}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{row.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Excel 파일 업로드</CardTitle>
              <CardDescription>
                새로운 Excel 데이터를 업로드합니다. 기존 데이터는 자동으로 버전 관리됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="excel-file">Excel 파일 선택</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "업로드 중..." : "업로드"}
                  </Button>
                  <Button 
                    onClick={handleExport}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>현재 데이터</CardTitle>
              <CardDescription>
                AI 분석 시 참조되는 활성 데이터입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : excelData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  업로드된 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {excelData.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            {item.file_name} - {item.sheet_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            업데이트: {new Date(item.last_updated).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "활성" : "비활성"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Preview first 5 rows */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(item.data_content[0] || {}).map((key) => (
                                <TableHead key={key} className="whitespace-nowrap">
                                  {key}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.data_content.slice(0, 5).map((row: any, index: number) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value: any, i: number) => (
                                  <TableCell key={i} className="whitespace-nowrap">
                                    {String(value)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {item.data_content.length > 5 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            ... 외 {item.data_content.length - 5}개 행
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}