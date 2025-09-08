import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = 'https://gqcruitsupinmhrvygql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  // Test with the admin account from TEST_ACCOUNTS.md
  const testAccounts = [
    { email: 'admin@example.com', password: 'admin123', name: 'Test Admin' },
    { email: 'admin@knowwhere.com', password: 'AdminPassword123!', name: 'Production Admin' }
  ];

  for (const account of testAccounts) {
    console.log(`\nTesting login for ${account.name} (${account.email})...`);
    
    try {
      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (authError) {
        console.error(`❌ Auth failed for ${account.email}:`, authError.message);
        
        // Check if company exists in database
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('email', account.email)
          .single();
        
        if (companyError) {
          console.error(`   Company not found in database:`, companyError.message);
        } else {
          console.log(`   Company exists in database:`, {
            id: company.id,
            email: company.email,
            is_admin: company.is_admin,
            is_approved: company.is_approved
          });
        }
      } else {
        console.log(`✅ Auth successful for ${account.email}`);
        console.log(`   User ID: ${authData.user.id}`);
        
        // Check company profile
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('email', account.email)
          .single();
        
        if (company) {
          console.log(`   Company profile:`, {
            id: company.id,
            email: company.email,
            company_name: company.company_name,
            is_admin: company.is_admin,
            is_approved: company.is_approved
          });
        }
        
        // Sign out after test
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${account.email}:`, error);
    }
  }
  
  console.log('\n\n=== Authentication Test Complete ===\n');
}

testAdminLogin().catch(console.error);