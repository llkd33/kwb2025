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

async function createAdminUser() {
  const email = 'admin@knowwhere.com';
  const password = 'AdminPassword123!';
  
  try {
    // First, create the auth user with admin metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: { is_admin: true } // Set admin flag in user metadata
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('Admin user already exists in auth');
        
        // Update the existing user's password
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === email);
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { 
              password,
              user_metadata: { is_admin: true } // Ensure admin flag is set
            }
          );
          if (updateError) throw updateError;
          console.log('Updated existing admin user password and metadata');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('Created auth user:', authData.user.email);
    }

    // Now create or update the admin company profile
    const companyData = {
      email,
      company_name: 'KnowWhere Admin',
      ceo_name: 'Admin',
      manager_name: 'Admin',
      manager_position: 'Administrator',
      password: password,
      headquarters_country: 'Korea',
      industry: 'Administration',
      phone_number: '000-000-0000',
      is_approved: true,
      is_admin: true, // Set as admin
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
      console.error('Error creating/updating admin company:', companyError);
    } else {
      console.log('Admin company profile created/updated:', company);
    }

    console.log('\n✅ Admin user setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now log in as admin with these credentials.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();