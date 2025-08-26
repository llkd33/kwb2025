import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://gqcruitsupinmhrvygql.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  const email = 'test@company.com';
  const password = 'TestPassword123!';
  
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('Test user already exists in auth');
        
        // Update the existing user's password
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === email);
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password }
          );
          if (updateError) throw updateError;
          console.log('Updated existing test user password');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('Created auth user:', authData.user.email);
    }

    // Now create or update the test company profile
    const companyData = {
      email,
      company_name: '테스트 회사',
      ceo_name: '김대표',
      manager_name: '이매니저',
      manager_position: '마케팅 매니저',
      password: password,
      headquarters_country: 'Korea',
      headquarters_city: 'Seoul',
      industry: 'Technology',
      phone_number: '010-1234-5678',
      is_approved: false, // 승인 대기 상태로 생성
      is_admin: false,
      founding_year: 2020,
      employee_count: '10-50',
      main_products: '소프트웨어 솔루션',
      target_market: '글로벌 시장',
      website: 'https://test-company.com'
    };

    // Try to upsert the company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert(companyData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating/updating test company:', companyError);
    } else {
      console.log('Test company profile created/updated:', company);
    }

    console.log('\n✅ Test user setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Status: 승인 대기 중 (Pending Approval)');
    console.log('\n이제 Admin 계정으로 로그인하여 이 회사를 승인할 수 있습니다.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();