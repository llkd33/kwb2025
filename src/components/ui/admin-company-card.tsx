import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, User, Mail, Phone, MapPin, Calendar, 
  CheckCircle, XCircle, Clock, Globe, Users 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Company {
  id: number;
  company_name: string;
  ceo_name: string;
  manager_name: string;
  manager_position: string;
  email: string;
  phone_number: string;
  industry: string;
  headquarters_country: string;
  headquarters_city: string;
  founding_year: number;
  employee_count: string;
  revenue_scale: string;
  main_products: string;
  target_market: string;
  competitive_advantage: string;
  company_vision: string;
  website: string;
  is_approved: boolean | null;
  created_at: string;
  rejection_reason?: string;
}

interface AdminCompanyCardProps {
  company: Company;
  showActions?: boolean;
  onApprove?: (company: Company) => void;
  onReject?: (company: Company) => void;
  actionLoading?: boolean;
}

export const AdminCompanyCard = ({
  company,
  showActions = false,
  onApprove,
  onReject,
  actionLoading = false,
}: AdminCompanyCardProps) => {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    if (company.is_approved === true) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('admin.status.approved')}
        </Badge>
      );
    } else if (company.is_approved === false) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          {t('admin.status.rejected')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {t('admin.status.pending')}
        </Badge>
      );
    }
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-xl">{company.company_name}</span>
              {getStatusBadge()}
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>CEO: {company.ceo_name}</span>
                <span className="text-muted-foreground">|</span>
                <span>{t('company.manager')}: {company.manager_name} ({company.manager_position})</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(company.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('company.registration_info')}
            </h4>
            <div className="space-y-2 text-sm pl-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('company.email')}:</span>
                <span>{company.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('company.phone')}:</span>
                <span>{company.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('company.industry')}:</span>
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('company.country')}:</span>
                <span>{company.headquarters_country}, {company.headquarters_city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('company.employees')}:</span>
                <span>{company.employee_count}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('company.business_info')}
            </h4>
            <div className="space-y-3 text-sm pl-6">
              <div>
                <span className="font-medium text-muted-foreground">{t('company.products')}:</span>
                <p className="text-foreground mt-1 leading-relaxed">{company.main_products}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">{t('company.target_market')}:</span>
                <p className="text-foreground mt-1 leading-relaxed">{company.target_market}</p>
              </div>
              {company.competitive_advantage && (
                <div>
                  <span className="font-medium text-muted-foreground">{t('company.competitive_advantage')}:</span>
                  <p className="text-foreground mt-1 leading-relaxed">{company.competitive_advantage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {company.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {t('admin.rejection_reason', 'Rejection Reason')}
            </h4>
            <p className="text-red-700 text-sm leading-relaxed">{company.rejection_reason}</p>
          </div>
        )}

        {showActions && company.is_approved === null && (
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => onApprove?.(company)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('admin.actions.approve')}
            </Button>
            <Button 
              onClick={() => onReject?.(company)}
              disabled={actionLoading}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('admin.actions.reject')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};