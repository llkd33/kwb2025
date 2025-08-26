import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqcruitsupinmhrvygql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  const email = 'test@knowwhere.com';
  const password = 'TestPassword123!';
  
  console.log('Testing authentication...');
  console.log('Email:', email);
  console.log('Password:', password);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication failed:', error);
    } else {
      console.log('Authentication successful!');
      console.log('User:', data.user?.email);
      console.log('Session:', data.session ? 'Created' : 'Not created');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAuth();