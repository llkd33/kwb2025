import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use service role key for admin operations
const supabaseUrl = 'https://gqcruitsupinmhrvygql.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  console.error('Please add it to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminAuth() {
  const email = 'admin@example.com';
  const password = 'admin123';
  
  console.log('Fixing admin authentication for:', email);
  
  try {
    // First check if the user already exists in auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const existingUser = users.users.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists in auth, updating password...');
      
      // Update the existing user's password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { 
          password,
          email_confirm: true,
          user_metadata: { is_admin: true }
        }
      );
      
      if (updateError) throw updateError;
      console.log('✅ Updated existing admin user password and metadata');
    } else {
      console.log('Creating new auth user...');
      
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { is_admin: true }
      });
      
      if (authError) throw authError;
      console.log('✅ Created auth user:', authData.user.email);
    }
    
    // Verify the company record exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', email)
      .single();
    
    if (companyError) {
      console.log('Company not found, creating...');
      
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert({
          email,
          password,
          company_name: 'KnowWhere Bridge Admin',
          ceo_name: 'Admin User',
          manager_name: 'System Administrator',
          manager_position: 'Admin',
          phone_number: '+82-10-0000-0000',
          industry: 'Technology',
          headquarters_country: 'South Korea',
          headquarters_city: 'Seoul',
          founding_year: 2023,
          employee_count: '10-50',
          revenue_scale: '1억원 이하',
          main_products: 'Global Business Matching Platform',
          target_market: 'Global Companies',
          competitive_advantage: 'AI-powered matching system',
          company_vision: 'Connect businesses worldwide',
          website: 'https://knowwhere-bridge.com',
          is_approved: true,
          is_admin: true
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      console.log('✅ Created company profile');
    } else {
      console.log('✅ Company profile already exists:', {
        id: company.id,
        email: company.email,
        is_admin: company.is_admin,
        is_approved: company.is_approved
      });
      
      // Update to ensure admin status
      const { error: updateCompanyError } = await supabase
        .from('companies')
        .update({ 
          is_admin: true, 
          is_approved: true,
          password: password 
        })
        .eq('email', email);
      
      if (updateCompanyError) throw updateCompanyError;
      console.log('✅ Updated company to ensure admin status');
    }
    
    console.log('\n=== Admin Account Fixed Successfully! ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now log in with these credentials.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminAuth();