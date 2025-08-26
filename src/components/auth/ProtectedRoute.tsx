import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // If an admin is required, verify against the companies table
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!requireAdmin || !user) return;
      try {
        setCheckingAdmin(true);
        // Prefer server source of truth over user metadata/localStorage
        const { data, error } = await supabase
          .from('companies')
          .select('is_admin, email')
          .eq('email', user.email as string)
          .single();
        if (error) throw error;
        setIsAdmin(!!data?.is_admin);
      } catch (_) {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    verifyAdmin();
  }, [requireAdmin, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    // While verifying admin, show a lightweight loader
    if (checkingAdmin || isAdmin === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
