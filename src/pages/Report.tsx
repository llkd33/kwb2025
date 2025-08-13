import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MarketResearchDisplay } from "@/components/ui/market-research-display";

interface MatchingRequest {
  id: number;
  company_id: number;
  status: string;
  workflow_status?: string;
  ai_analysis?: any;
  market_research?: any;
  final_report?: any;
  created_at: string;
  completed_at?: string | null;
}

export default function Report() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<MatchingRequest | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const currentCompanyRaw = localStorage.getItem('currentCompany');
        if (!currentCompanyRaw) {
          navigate('/auth');
          return;
        }
        const currentCompany = JSON.parse(currentCompanyRaw);
        if (!token) throw new Error('유효하지 않은 토큰');

        const { data, error } = await supabase
          .from('matching_requests')
          .select('*')
          .eq('report_token', token)
          .single();

        if (error) throw error;
        // Optional client-side expiry check
        if ((data as any)?.report_token_expires_at) {
          const exp = new Date((data as any).report_token_expires_at);
          if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
            throw new Error('보고서 링크가 만료되었습니다. 관리자에게 문의하세요.');
          }
        }
        setRequest(data as any);
      } catch (e: any) {
        toast({ title: '보고서 조회 실패', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, navigate, toast]);

  const renderSmartValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-gray-500">-</span>;
    if (typeof value === 'string') {
      // JSON 문자열 자동 파싱 시도
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try { return renderSmartValue(JSON.parse(trimmed)); } catch { /* ignore */ }
      }
      // 번호/불릿 분해 및 문단 정리
      const normalized = value
        .replace(/\t/g, '    ')
        .replace(/\s+$/gm, '')
        .replace(/\r\n?/g, '\n');
      const items = normalized.split(/(?:^|\n)(?:[•\-\*]|\d+[\.\)])\s+/);
      if (items.length > 1) {
        return (
          <ul className="space-y-2 list-disc list-inside">
            {items.filter(i => i.trim()).map((i, idx) => (
              <li key={idx} className="leading-relaxed">{i.trim()}</li>
            ))}
          </ul>
        );
      }
      const paragraphs = normalized.split('\n\n');
      if (paragraphs.length > 1) {
        return (
          <div className="space-y-3">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-wrap leading-relaxed">{p.trim()}</p>
            ))}
          </div>
        );
      }
      return <p className="whitespace-pre-wrap leading-relaxed">{normalized}</p>;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="ml-2">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      return (
        <div className="space-y-3">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="bg-gray-50 p-3 rounded-lg">
              <strong className="text-gray-800 block mb-2">{k.replace(/_/g, ' ')}</strong>
              <div className="text-sm text-gray-700">{renderSmartValue(v)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">로딩 중...</div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>보고서를 찾을 수 없습니다</CardTitle>
            <CardDescription>요청 ID가 올바른지 확인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>마이페이지로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 우선순위: final_report > (ai_analysis, market_research)
  const finalReport = request.final_report || null;
  const ai = finalReport?.gpt_analysis || request.ai_analysis || null;
  const mr = finalReport?.market_research || request.market_research || null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">분석 결과</h1>
          <p className="text-gray-600">요청 번호 #{request.id}</p>
        </div>
        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
          {request.status === 'completed' ? '완료' : '진행중'}
        </Badge>
      </div>

      {/* GPT 분석 */}
      {ai && (
        <Card>
          <CardHeader>
            <CardTitle>🤖 GPT 종합 분석</CardTitle>
            <CardDescription>핵심 섹션별로 정리된 분석 결과입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderSmartValue(ai)}
          </CardContent>
        </Card>
      )}

      {/* Perplexity 시장조사 */}
      {mr && (
        <Card>
          <CardHeader>
            <CardTitle>🌍 실시간 시장 조사</CardTitle>
            <CardDescription>Perplexity AI 기반 최신 시장 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketResearchDisplay data={mr} citations={mr?.citations || mr?.data?.citations} />
          </CardContent>
        </Card>
      )}

      {!ai && !mr && (
        <Card>
          <CardHeader>
            <CardTitle>아직 표시할 분석 결과가 없습니다</CardTitle>
            <CardDescription>관리자 승인 및 보고서 생성 완료 후 확인 가능합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>마이페이지로 돌아가기</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


