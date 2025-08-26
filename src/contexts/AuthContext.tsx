import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has associated company profile
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('email', email)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        throw companyError;
      }

      if (!company) {
        toast({
          title: "Company Profile Not Found",
          description: "Please complete your company registration first.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      // Skip approval check for admin users
      if (!company.is_admin && !company.is_approved) {
        toast({
          title: "Pending Approval",
          description: "Your company registration is pending approval. Please wait for admin verification.",
          variant: "default",
        });
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: "Sign In Successful",
        description: company.is_admin ? "Welcome, Administrator!" : `Welcome back, ${company.company_name}!`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in.';
      toast({
        title: "Sign In Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const signUp = async (email: string, password: string, metadata?: unknown) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up.';
      toast({
        title: "Sign Up Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign out.';
      toast({
        title: "Sign Out Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while sending the reset email.';
      toast({
        title: "Password Reset Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating your password.';
      toast({
        title: "Password Update Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
