import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, TrendingUp, Users, Target, Lightbulb, FileText, 
  ExternalLink, ChevronRight, Building2, DollarSign, 
  BarChart3, Shield, Zap, BookOpen, Info, CheckCircle2,
  XCircle, Mail, ArrowRight
} from 'lucide-react';

type Citation = { url?: string; title?: string; snippet?: string; source?: string };
interface MarketResearchDisplayProps {
  data: unknown;
  citations?: Citation[];
}

export function MarketResearchDisplay({ data, citations }: MarketResearchDisplayProps) {
  // Parse and organize the market research data
  const parseMarketData = (rawData: unknown) => {
    // Basic guard
    if (!rawData) return {} as Record<string, unknown>;
    // Cast for object access
    const obj = rawData as Record<string, unknown>;
    const rec = obj as Record<string, unknown>;
    // Handle nested structure from Perplexity API
    if (rawData && typeof rawData === 'object') {
      // First check if the data already has the expected keys (flat structure)
      const hasDirectKeys = 'market_size' in rec || 'positioning' in rec || 'recent_deals' in rec || 
                           'top_companies' in rec || 'country_markets' in rec;
      
      if (hasDirectKeys) {
        // Map the flat keys to expected structure
        const mapped: Record<string, unknown> = {};
        
        // Market Analysis mappings
        if ('country_markets' in rec) mapped.market_country_markets = rec['country_markets'];
        if ('market_size' in rec) mapped.market_market_size = rec['market_size'];
        if ('recent_changes' in rec) mapped.market_recent_changes = rec['recent_changes'];
        
        // Competitors mappings
        if ('top_companies' in rec) mapped.competitors_top_companies = rec['top_companies'];
        if ('positioning' in rec) mapped.competitors_positioning = rec['positioning'];
        if ('recent_performance' in rec) mapped.competitors_recent_performance = rec['recent_performance'];
        
        // Partnerships mappings
        if ('recent_deals' in rec) mapped.partnerships_recent_deals = rec['recent_deals'];
        if ('success_cases' in rec) mapped.partnerships_success_cases = rec['success_cases'];
        if ('failure_analysis' in rec) mapped.partnerships_failure_analysis = rec['failure_analysis'];
        
        // Additional mappings for any other keys
        Object.keys(rec).forEach(key => {
          if (!mapped[`market_${key}`] && !mapped[`competitors_${key}`] && !mapped[`partnerships_${key}`]) {
            // Try to categorize based on key name
            if (key.includes('market') || key.includes('size') || key.includes('country')) {
              mapped[`market_${key}`] = rec[key];
            } else if (key.includes('company') || key.includes('position') || key.includes('performance')) {
              mapped[`competitors_${key}`] = rec[key];
            } else if (key.includes('deal') || key.includes('success') || key.includes('failure')) {
              mapped[`partnerships_${key}`] = rec[key];
            } else {
              // Default mapping
              mapped[key] = rec[key];
            }
          }
        });
        
        return mapped;
      }
      
      // Check for nested data structure (original logic)
      const flattened: Record<string, unknown> = {};
      
      const market_analysis = rec['market_analysis'] as Record<string, unknown> | undefined;
      if (market_analysis && typeof market_analysis === 'object') {
        Object.entries(market_analysis).forEach(([key, value]) => {
          flattened[`market_${key}`] = value;
        });
      }
      
      const competitors = rec['competitors'] as Record<string, unknown> | undefined;
      if (competitors && typeof competitors === 'object') {
        Object.entries(competitors).forEach(([key, value]) => {
          flattened[`competitors_${key}`] = value;
        });
      }
      
      const partnerships = rec['partnerships'] as Record<string, unknown> | undefined;
      if (partnerships && typeof partnerships === 'object') {
        Object.entries(partnerships).forEach(([key, value]) => {
          flattened[`partnerships_${key}`] = value;
        });
      }
      
      const potential_partners = rec['potential_partners'] as Record<string, unknown> | undefined;
      if (potential_partners && typeof potential_partners === 'object') {
        Object.entries(potential_partners).forEach(([key, value]) => {
          flattened[`partners_${key}`] = value;
        });
      }
      
      const risks = rec['risks'] as Record<string, unknown> | undefined;
      if (risks && typeof risks === 'object') {
        Object.entries(risks).forEach(([key, value]) => {
          flattened[`risks_${key}`] = value;
        });
      }
      
      const summary = rec['summary'] as Record<string, unknown> | undefined;
      if (summary && typeof summary === 'object') {
        Object.entries(summary).forEach(([key, value]) => {
          flattened[`summary_${key}`] = value;
        });
      }
      
      // If we have flattened data, use it; otherwise use original
      if (Object.keys(flattened).length > 0) {
        return flattened;
      }
      
      // If no nested structure, return as is
      return rawData;
    }
    
    if (typeof rawData === 'string') {
      // If it's a string, try to extract key sections
      const sections: Record<string, string> = {};
      const lines = rawData.split('\n');
      let currentSection = 'overview';
      let currentContent: string[] = [];

      lines.forEach(line => {
        // Check if line is a section header (starts with number or bullet)
        if (/^[#\d]+[.)]\s+|^[•\-*]\s+/.test(line)) {
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n').trim();
          }
          // Extract section name from the line
          const sectionMatch = line.match(/^[#\d]+[.)]\s+(.+)|^[•\-*]\s+(.+)/);
          if (sectionMatch) {
            currentSection = (sectionMatch[1] || sectionMatch[2]).toLowerCase().replace(/[^a-z0-9]/g, '_');
            currentContent = [];
          }
        } else if (line.trim()) {
          currentContent.push(line);
        }
      });

      // Add the last section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      return sections;
    }
    
    return {};
  };

  const source = (typeof data === 'object' && data !== null && 'data' in (data as Record<string, unknown>))
    ? (data as Record<string, unknown>).data
    : data;
  const marketData = parseMarketData(source);
  
  // Debug logging
  console.log('Market Research Display - Raw data:', data);
  console.log('Market Research Display - Citations:', citations);
  console.log('Market Research Display - Parsed data:', marketData);
  console.log('Market Research Display - Data keys:', Object.keys(marketData));

  // Define section configurations with icons and colors
  const sectionConfigs: Record<string, { icon: React.ElementType; color: string; title: string }> = {
    // Market Analysis sections
    market_country_markets: { icon: Globe, color: 'blue', title: '국가별 시장/규제/정책' },
    market_market_size: { icon: BarChart3, color: 'green', title: '시장규모 및 성장률' },
    market_recent_changes: { icon: TrendingUp, color: 'purple', title: '최근 변경사항' },
    
    // Competitors sections
    competitors_top_companies: { icon: Building2, color: 'orange', title: 'Top 3-5사 비교분석' },
    competitors_positioning: { icon: Target, color: 'red', title: '포지셔닝 분석' },
    competitors_recent_performance: { icon: TrendingUp, color: 'purple', title: '최근 성과' },
    
    // Partnerships sections
    partnerships_recent_deals: { icon: Users, color: 'teal', title: '최근 MoU/Agreement/M&A' },
    partnerships_success_cases: { icon: CheckCircle2, color: 'green', title: '성공 사례' },
    partnerships_failure_analysis: { icon: XCircle, color: 'red', title: '실패 분석' },
    
    // Potential Partners sections
    partners_priority_companies: { icon: Users, color: 'blue', title: '우선순위 10개사' },
    partners_approach_strategy: { icon: Target, color: 'indigo', title: '접근 전략' },
    partners_contact_methods: { icon: Mail, color: 'teal', title: '실무적 접근법' },
    
    // Risks sections
    risks_regulatory_risks: { icon: Shield, color: 'red', title: '규제 리스크' },
    risks_cultural_risks: { icon: Globe, color: 'pink', title: '문화적 리스크' },
    risks_competitive_risks: { icon: Target, color: 'orange', title: '경쟁 리스크' },
    risks_mitigation_strategies: { icon: Shield, color: 'green', title: '대응 시나리오' },
    
    // Summary sections
    summary_key_points: { icon: Lightbulb, color: 'yellow', title: '핵심 포인트' },
    summary_recommendations: { icon: CheckCircle2, color: 'emerald', title: '추천사항' },
    summary_next_steps: { icon: ArrowRight, color: 'indigo', title: '다음 단계' },
    
    // Legacy sections (for backward compatibility)
    market_overview: { icon: Globe, color: 'blue', title: '시장 개요' },
    시장_개요: { icon: Globe, color: 'blue', title: '시장 개요' },
    market_size: { icon: BarChart3, color: 'green', title: '시장 규모' },
    시장_규모: { icon: BarChart3, color: 'green', title: '시장 규모' },
  };

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-50`,
    border: `border-${color}-200`,
    text: `text-${color}-900`,
    badge: color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
           color === 'orange' ? 'bg-orange-100 text-orange-800' :
           color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
           color === 'teal' ? 'bg-teal-100 text-teal-800' :
           color === 'pink' ? 'bg-pink-100 text-pink-800' :
           color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
           `bg-${color}-100 text-${color}-800`,
  });

  const formatContent = (content: unknown) => {
    if (typeof content === 'string') {
      // Split by bullet points or numbered lists
      const normalized = content
        .replace(/\t/g, '    ') // tabs -> spaces
        .replace(/\s+$/gm, '')  // trim trailing spaces each line
        .replace(/\r\n?/g, '\n'); // normalize newlines
      const items = normalized.split(/(?:^|\n)(?:[•\-*]|\d+[.)])\s+/);
      
      if (items.length > 1) {
        return (
          <ul className="space-y-3">
            {items.filter(item => item.trim()).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Format paragraphs
      const paragraphs = content.split('\n\n');
      if (paragraphs.length > 1) {
        return (
          <div className="space-y-4">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        );
      }

      return <p className="text-gray-700 leading-relaxed">{content}</p>;
    }

    if (Array.isArray(content)) {
      return (
        <ul className="space-y-3">
          {content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 leading-relaxed">{String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(content).map(([key, value]) => (
            <div key={key}>
              <h5 className="font-semibold text-gray-800 mb-2">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h5>
              <div className="pl-4">{formatContent(value)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-700">{String(content)}</p>;
  };

  // Group sections by category
  const categorizedSections = {
    market: ['market_country_markets', 'market_market_size', 'market_recent_changes', 'market_overview', '시장_개요', 'market_size', '시장_규모'],
    competition: ['competitors_top_companies', 'competitors_positioning', 'competitors_recent_performance'],
    partnerships: ['partnerships_recent_deals', 'partnerships_success_cases', 'partnerships_failure_analysis'],
    partners: ['partners_priority_companies', 'partners_approach_strategy', 'partners_contact_methods'],
    risks: ['risks_regulatory_risks', 'risks_cultural_risks', 'risks_competitive_risks', 'risks_mitigation_strategies'],
    summary: ['summary_key_points', 'summary_recommendations', 'summary_next_steps'],
  };

  const getSectionsForCategory = (category: string) => {
    return categorizedSections[category as keyof typeof categorizedSections] || [];
  };

  const hasContent = (category: string) => {
    return getSectionsForCategory(category).some(section => marketData[section]);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-600" />
              실시간 시장 조사 결과
            </CardTitle>
            <CardDescription className="text-base">
              Perplexity AI 기반 최신 시장 분석 리포트
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Zap className="w-3 h-3 mr-1" />
            실시간 데이터
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b px-6 h-auto py-0 bg-gray-50">
            {hasContent('market') && (
              <TabsTrigger value="market" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                시장 분석
              </TabsTrigger>
            )}
            {hasContent('competition') && (
              <TabsTrigger value="competition" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <Target className="w-4 h-4 mr-2" />
                경쟁사 분석
              </TabsTrigger>
            )}
            {hasContent('partnerships') && (
              <TabsTrigger value="partnerships" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <Users className="w-4 h-4 mr-2" />
                파트너십
              </TabsTrigger>
            )}
            {hasContent('partners') && (
              <TabsTrigger value="partners" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <Building2 className="w-4 h-4 mr-2" />
                잠재 파트너
              </TabsTrigger>
            )}
            {hasContent('risks') && (
              <TabsTrigger value="risks" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <Shield className="w-4 h-4 mr-2" />
                리스크 분석
              </TabsTrigger>
            )}
            {hasContent('summary') && (
              <TabsTrigger value="summary" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <Lightbulb className="w-4 h-4 mr-2" />
                요약 & 추천
              </TabsTrigger>
            )}
            {citations && citations.length > 0 && (
              <TabsTrigger value="sources" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                <BookOpen className="w-4 h-4 mr-2" />
                참고자료
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[600px]">
            {Object.keys(categorizedSections).map(category => (
              hasContent(category) && (
                <TabsContent key={category} value={category} className="p-6 space-y-6">
                  {getSectionsForCategory(category).map(sectionKey => {
                    const sectionData = marketData[sectionKey];
                    if (!sectionData) return null;

                    const config = sectionConfigs[sectionKey] || {
                      icon: Info,
                      color: 'gray',
                      title: sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    };
                    const Icon = config.icon;
                    const colors = getColorClasses(config.color);

                    return (
                      <div key={sectionKey} className={`rounded-lg border ${colors.border} ${colors.bg} p-6`}>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${colors.badge}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <h3 className={`text-xl font-semibold ${colors.text}`}>
                              {config.title}
                            </h3>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              {formatContent(sectionData)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              )
            ))}

            {citations && citations.length > 0 && (
              <TabsContent value="sources" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    참고 자료 및 출처
                  </h3>
                  <div className="grid gap-4">
                    {citations.map((citation: Citation, index: number) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <ExternalLink className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
                              >
                                {citation.title || citation.url}
                                <ChevronRight className="w-4 h-4" />
                              </a>
                              {citation.snippet && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {citation.snippet}
                                </p>
                              )}
                              {citation.source && (
                                <Badge variant="outline" className="text-xs">
                                  {citation.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
