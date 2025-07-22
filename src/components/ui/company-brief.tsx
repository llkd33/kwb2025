import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Users, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function CompanyBrief() {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-gradient-card">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <Badge variant="outline" className="mb-6">
            {t('company.brief.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('company.brief.title')}
            <br />
            <span className="text-primary">{t('service.name')}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t('company.brief.subtitle')}
          </p>

          {/* Key Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t('company.brief.global_network')}</h3>
                <p className="text-muted-foreground">{t('company.brief.global_partners')}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t('company.brief.expert_group')}</h3>
                <p className="text-muted-foreground">{t('company.brief.verified_experts')}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t('company.brief.ai_platform')}</h3>
                <p className="text-muted-foreground">{t('company.brief.custom_ai')}</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Button size="lg" className="bg-gradient-primary hover:opacity-90">
            {t('company.brief.learn_more')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}