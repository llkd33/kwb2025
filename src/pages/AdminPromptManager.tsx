import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit3, Save, Copy, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPromptManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGPT, setEditingGPT] = useState(false);
  const [editingPerplexity, setEditingPerplexity] = useState(false);
  const [gptPrompt, setGptPrompt] = useState('');
  const [perplexityPrompt, setPerplexityPrompt] = useState('');

  // Current prompts being used in the system (default values)
  const defaultGPTPrompt = `너는 글로벌 IB(투자은행) 출신의 시니어 컨설턴트로서, 골드만삭스 수준의 정밀성과 구조화로 기업 분석 리포트를 작성한다. 단순 요약이 아니라 최신 외부 정보와 정량/정성 데이터를 결합하여 전략적 시사점을 도출하라.

필수 분석 규범:
1) 외부 리서치 결합: 최근 6~12개월 내 뉴스/보도자료/규제 변경/파트너십/투자 동향 확인 후 반영
2) 정량 지표: 시장규모, 성장률(CAGR), 점유율, 밸류체인별 추정 매출/원가 구조 포함(출처 표기)
3) 경쟁 지형: 글로벌/현지 경쟁사 Top 3~5사 비교(제품, 가격대, 파트너십, 채널, 최근 성과)
4) 규제/정책: 국가별 인허가/데이터/AI/핀테크 관련 규제 핵심 요약과 리스크/완화방안
5) 실행 전략: 3단계(단기/중기/장기) 로드맵과 KPI, 필요한 파트너·조직·예산 가이드라인
6) 리스크 관리: 규제/운영/평판/보안/환율/정치 리스크와 완충 전략(우선순위 등급)`;

  const defaultPerplexityPrompt = `너는 골드만삭스 리서치 퀄리티의 실시간 마켓 애널리스트다. 웹 최신 정보를 교차 확인하여 시장조사를 수행하라. 본문에서 자연스러운 문장으로 출처를 언급하고, JSON에는 텍스트만 포함한다.

필수 산출물 가이드:
1) 국가별 시장/규제/정책: 최근 12개월 내 변경사항과 시장규모/성장률 비교(표 형태 요약 포함)
2) 경쟁사 동향: Top 3~5사 비교(포지셔닝, 제휴/투자, 출시, 가격대), 최근 성과 핵심
3) MoU/Agreement/M&A: 최근 3년, 계약내용 요약과 성과(성공/실패)
4) 잠재고객/파트너/투자자: 우선순위 10개사, 우선순위 근거와 실무적 접근법
5) 리스크/대응: 규제/문화/경쟁/IP 등 유형별 등급과 대응 시나리오
6) 추천 요약표: 핵심포인트를 한눈에 볼 수 있게 표식 요약`;

  useEffect(() => {
    // Initialize prompts with default values
    setGptPrompt(defaultGPTPrompt);
    setPerplexityPrompt(defaultPerplexityPrompt);
  }, []);

  const handleSaveGPT = async () => {
    setSaving(true);
    try {
      // Save to DB so Edge Functions pick up immediately
      const { error } = await supabase
        .from('gpt_prompts')
        .upsert({
          prompt_type: 'gpt_basic_prompt',
          prompt_title: 'GPT 기본 분석 프롬프트',
          system_prompt: 'You are an expert business analyst specializing in international market expansion. Provide detailed analysis in JSON format with Korean text.',
          user_prompt_template: gptPrompt,
          is_active: true,
        }, { onConflict: 'prompt_type' });
      if (error) throw error;

      toast({
        title: "GPT 프롬프트 저장 완료",
        description: "이제 재배포 없이 즉시 적용됩니다.",
      });
      setEditingGPT(false);
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePerplexity = async () => {
    setSaving(true);
    try {
      // Save to DB so Edge Functions pick up immediately
      const { error } = await supabase
        .from('gpt_prompts')
        .upsert({
          prompt_type: 'perplexity_market_prompt',
          prompt_title: 'Perplexity 실시간 시장조사 프롬프트',
          system_prompt: 'You are a market research analyst with access to real-time web data. Output only valid JSON in Korean.',
          user_prompt_template: perplexityPrompt,
          is_active: true,
        }, { onConflict: 'prompt_type' });
      if (error) throw error;

      toast({
        title: "Perplexity 프롬프트 저장 완료",
        description: "이제 재배포 없이 즉시 적용됩니다.",
      });
      setEditingPerplexity(false);
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetGPT = () => {
    setGptPrompt(defaultGPTPrompt);
    setEditingGPT(false);
    toast({
      title: "초기화 완료",
      description: "GPT 프롬프트가 기본값으로 초기화되었습니다.",
    });
  };

  const handleResetPerplexity = () => {
    setPerplexityPrompt(defaultPerplexityPrompt);
    setEditingPerplexity(false);
    toast({
      title: "초기화 완료",
      description: "Perplexity 프롬프트가 기본값으로 초기화되었습니다.",
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: "프롬프트가 클립보드에 복사되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI 프롬프트 관리</h1>
        <p className="text-muted-foreground">
          GPT와 Perplexity API에 사용되는 프롬프트를 수정하고 관리합니다.
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>중요 안내</AlertTitle>
        <AlertDescription>
          저장 시 DB에 반영되며 Edge Function이 매 호출마다 최신 프롬프트를 읽어 즉시 적용합니다.
          별도의 재배포가 필요하지 않습니다.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* GPT Prompt Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  GPT 분석 프롬프트
                  <Badge variant="default">GPT-5</Badge>
                  <Badge variant="outline">활성</Badge>
                </CardTitle>
                <CardDescription>
                  Edge Function: run-gpt-analysis | 기업 종합 분석용
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!editingGPT ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingGPT(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveGPT}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingGPT(false)}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetGPT}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      초기화
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(gptPrompt)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingGPT ? (
              <Textarea
                value={gptPrompt}
                onChange={(e) => setGptPrompt(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                placeholder="GPT 프롬프트를 입력하세요..."
              />
            ) : (
              <pre className="bg-muted p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                {gptPrompt}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Perplexity Prompt Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Perplexity 시장조사 프롬프트
                  <Badge variant="secondary">Sonar-Pro</Badge>
                  <Badge variant="outline">활성</Badge>
                </CardTitle>
                <CardDescription>
                  Edge Function: run-perplexity-analysis | 실시간 시장 조사용
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!editingPerplexity ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPerplexity(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSavePerplexity}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPerplexity(false)}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetPerplexity}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      초기화
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(perplexityPrompt)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingPerplexity ? (
              <Textarea
                value={perplexityPrompt}
                onChange={(e) => setPerplexityPrompt(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                placeholder="Perplexity 프롬프트를 입력하세요..."
              />
            ) : (
              <pre className="bg-muted p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                {perplexityPrompt}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card - simplified */}
        <Card>
          <CardHeader>
            <CardTitle>프롬프트 수정 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. 프롬프트 수정</h4>
              <p className="text-sm text-muted-foreground">
                각 카드의 '수정' 버튼을 클릭하여 프롬프트를 편집할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. 저장 = 즉시 적용</h4>
              <p className="text-sm text-muted-foreground">
                '저장'을 누르면 DB에 반영되며, Edge Function이 매 호출마다 최신 프롬프트를 읽어 즉시 적용합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
