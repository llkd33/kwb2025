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
  const email = 'test@knowwhere.com';
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
        console.log('User already exists in auth');
        
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
          console.log('Updated existing user password');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('Created auth user:', authData.user.email);
    }

    // Now create or update the company profile
    const companyData = {
      email,
      company_name: 'Test Company',
      ceo_name: 'Test CEO',
      manager_name: 'Test Manager',
      manager_position: 'Manager',
      password: password, // Store hashed password
      headquarters_country: 'United States',
      industry: 'Technology',
      phone_number: '123-456-7890',
      is_approved: true, // Auto-approve for testing
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
      console.error('Error creating/updating company:', companyError);
    } else {
      console.log('Company profile created/updated:', company);
    }

    console.log('\n✅ Test user setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now log in with these credentials.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();