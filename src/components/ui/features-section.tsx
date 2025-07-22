import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Globe, 
  BarChart3, 
  Users, 
  Mail, 
  CheckCircle,
  Upload,
  Search,
  Shield
} from "lucide-react";

export function FeaturesSection() {
  const { t } = useLanguage();
  const features = [
    {
      icon: Upload,
      title: t('home.features.ai.title'),
      description: t('home.features.ai.desc'),
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: t('home.features.auto_analysis'),
      description: t('home.features.auto_analysis_desc'),
      color: "text-emerald-600"
    },
    {
      icon: Users,
      title: t('home.features.expert.title'),
      description: t('home.features.expert.desc'),
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: t('home.features.custom_report'),
      description: t('home.features.custom_report_desc'),
      color: "text-orange-600"
    },
    {
      icon: Globe,
      title: t('home.features.global.title'),
      description: t('home.features.global.desc'),
      color: "text-cyan-600"
    },
    {
      icon: Shield,
      title: t('home.features.security'),
      description: t('home.features.security_desc'),
      color: "text-red-600"
    }
  ];

  const process = [
    { step: "01", title: t('home.process.step1'), desc: t('home.process.step1_desc') },
    { step: "02", title: t('home.process.step2'), desc: t('home.process.step2_desc') },
    { step: "03", title: t('home.process.step3'), desc: t('home.process.step3_desc') },
    { step: "04", title: t('home.process.step4'), desc: t('home.process.step4_desc') },
    { step: "05", title: t('home.process.step5'), desc: t('home.process.step5_desc') },
    { step: "06", title: t('home.process.step6'), desc: t('home.process.step6_desc') }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t('home.features.core_features')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-premium transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Process Flow */}
          <div className="bg-gradient-card rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t('home.process.title')}
                <br />
                <span className="text-primary">{t('home.process.subtitle')}</span>
              </h3>
              <p className="text-muted-foreground">
                {t('home.process.desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  
                  {/* Connector Line */}
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform translate-x-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}