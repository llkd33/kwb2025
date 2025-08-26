import { useState } from "react";
import { ExcelUpload } from "@/components/ui/excel-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Database, TrendingUp, Users, Globe, Building, Lightbulb, Target } from "lucide-react";

interface UploadHistory {
  id: string;
  fileName: string;
  rowCount: number;
  uploadDate: string;
  dataType: string;
  status: "processing" | "completed" | "failed";
}

export default function AdminDataUpload() {
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [selectedDataType, setSelectedDataType] = useState("investment");
  const { toast } = useToast();

  const handleDataUploaded = async (data: any[], metadata: any) => {
    try {
      // Process and categorize data based on selected type
      const processedData = processDataByType(data, selectedDataType);
      
      // Store in database (you can customize this based on your needs)
      const { error } = await supabase
        .from('market_data')
        .insert({
          data_category: selectedDataType,
          data: processedData,
          metadata: metadata,
          is_active: true,
          country: extractCountry(data),
          industry: extractIndustry(data)
        });

      if (error) throw error;

      // Update history
      const newHistory: UploadHistory = {
        id: Date.now().toString(),
        fileName: metadata.fileName,
        rowCount: metadata.rowCount,
        uploadDate: new Date().toISOString(),
        dataType: selectedDataType,
        status: "completed"
      };
      
      setUploadHistory([newHistory, ...uploadHistory]);
      
      toast({
        title: "데이터 업로드 성공",
        description: `${metadata.rowCount}개의 ${getDataTypeLabel(selectedDataType)} 데이터가 저장되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processDataByType = (data: any[], type: string) => {
    // Process data based on type
    switch (type) {
      case "investment":
        return data.map(row => ({
          companyName: row["회사기업명"] || row["Company Name"],
          website: row["홈페이지"] || row["Website"],
          solution: row["주요솔루션"] || row["Main Solution"],
          ceo: row["대표자명"] || row["CEO"],
          investment: row["투자유치(억원)"] || row["Investment"],
          competitors: extractCompetitors(row),
          ...row
        }));
      case "market":
        return data.map(row => ({
          marketName: row["시장명"] || row["Market"],
          size: row["시장규모"] || row["Market Size"],
          growth: row["성장률"] || row["Growth Rate"],
          ...row
        }));
      default:
        return data;
    }
  };

  const extractCompetitors = (row: any) => {
    // Extract competitor information from various columns
    const competitors = [];
    Object.keys(row).forEach(key => {
      if (key.toLowerCase().includes("competitor") || 
          key.toLowerCase().includes("경쟁") ||
          ["onfido", "jumio", "sumsub"].includes(key.toLowerCase())) {
        if (row[key]) {
          competitors.push({
            name: key,
            value: row[key]
          });
        }
      }
    });
    return competitors;
  };

  const extractCountry = (data: any[]) => {
    // Try to extract country from data
    const countries = data.map(row => 
      row["국가"] || row["Country"] || row["지역"] || row["Region"] || "Global"
    );
    return [...new Set(countries)].join(", ").substring(0, 50);
  };

  const extractIndustry = (data: any[]) => {
    // Try to extract industry from data
    const industries = data.map(row => 
      row["산업"] || row["Industry"] || row["분야"] || row["Sector"] || "General"
    );
    return [...new Set(industries)].join(", ").substring(0, 50);
  };

  const getDataTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      investment: "투자유치 기업",
      market: "시장 데이터",
      competitor: "경쟁사 분석",
      partner: "파트너 정보",
      regulatory: "규제 정보"
    };
    return labels[type] || type;
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <TrendingUp className="h-4 w-4" />;
      case "market":
        return <Globe className="h-4 w-4" />;
      case "competitor":
        return <Users className="h-4 w-4" />;
      case "partner":
        return <Building className="h-4 w-4" />;
      case "regulatory":
        return <Target className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>데이터 업로드 센터</CardTitle>
          <CardDescription>
            투자 기업 정보, 시장 데이터, 경쟁사 분석 등 다양한 데이터를 업로드하고 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="investment" onValueChange={setSelectedDataType}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="investment" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                투자유치
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                시장 데이터
              </TabsTrigger>
              <TabsTrigger value="competitor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                경쟁사
              </TabsTrigger>
              <TabsTrigger value="partner" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                파트너
              </TabsTrigger>
              <TabsTrigger value="regulatory" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                규제 정보
              </TabsTrigger>
            </TabsList>

            <TabsContent value="investment" className="mt-6">
              <Alert className="mb-4">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>투자유치 기업 데이터 가이드</strong>
                  <p className="mt-2">권장 데이터 항목:</p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>회사기업명, 홈페이지, 대표자명</li>
                    <li>주요 제품/서비스, 핵심 기술</li>
                    <li>투자 라운드, 투자 금액, 투자사</li>
                    <li>경쟁사 정보 (onfido, jumio, sumsub 등)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <ExcelUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>

            <TabsContent value="market" className="mt-6">
              <Alert className="mb-4">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>시장 데이터 가이드</strong>
                  <p className="mt-2">권장 데이터 항목:</p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>시장 규모, 성장률, 예측</li>
                    <li>주요 트렌드, 기술 동향</li>
                    <li>지역별/산업별 세분화</li>
                    <li>시장 점유율, 경쟁 구조</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <ExcelUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>

            <TabsContent value="competitor" className="mt-6">
              <Alert className="mb-4">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>경쟁사 분석 데이터 가이드</strong>
                  <p className="mt-2">권장 데이터 항목:</p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>경쟁사명, 웹사이트, 설립연도</li>
                    <li>주요 제품/서비스, 차별화 포인트</li>
                    <li>시장 점유율, 매출 규모</li>
                    <li>강점, 약점, 기회, 위협 (SWOT)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <ExcelUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>

            <TabsContent value="partner" className="mt-6">
              <Alert className="mb-4">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>파트너 정보 데이터 가이드</strong>
                  <p className="mt-2">권장 데이터 항목:</p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>파트너사명, 연락처, 담당자</li>
                    <li>파트너십 유형, 협력 분야</li>
                    <li>과거 협력 사례, 성과</li>
                    <li>잠재 시너지, 협력 기회</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <ExcelUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>

            <TabsContent value="regulatory" className="mt-6">
              <Alert className="mb-4">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>규제 정보 데이터 가이드</strong>
                  <p className="mt-2">권장 데이터 항목:</p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>국가/지역별 규제 현황</li>
                    <li>인증 요구사항, 표준</li>
                    <li>규제 변화 동향, 예정 변경사항</li>
                    <li>컴플라이언스 체크리스트</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <ExcelUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>
          </Tabs>

          {/* Upload History */}
          {uploadHistory.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">최근 업로드 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDataTypeIcon(item.dataType)}
                        <div>
                          <p className="font-medium">{item.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {item.rowCount}개 행 | {new Date(item.uploadDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.dataType === "investment" ? "default" : "secondary"}>
                          {getDataTypeLabel(item.dataType)}
                        </Badge>
                        <Badge 
                          variant={
                            item.status === "completed" ? "default" : 
                            item.status === "processing" ? "secondary" : 
                            "destructive"
                          }
                        >
                          {item.status === "completed" ? "완료" : 
                           item.status === "processing" ? "처리중" : "실패"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}