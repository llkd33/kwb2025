import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardQuery() {
  console.log('Testing Dashboard query without embed...\n');
  
  // Test the fixed query - fetching matching_requests without embedding
  const { data: requestsData, error: requestsError } = await supabase
    .from('matching_requests')
    .select('id, status, workflow_status, created_at, company_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (requestsError) {
    console.error('❌ Error fetching matching_requests:', requestsError.message);
    return;
  }

  console.log('✅ Successfully fetched matching_requests:', requestsData?.length || 0, 'records');

  if (requestsData && requestsData.length > 0) {
    // Get unique company IDs
    const companyIds = Array.from(new Set(requestsData.map(r => r.company_id).filter(Boolean)));
    
    if (companyIds.length > 0) {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name')
        .in('id', companyIds);
      
      if (companiesError) {
        console.error('❌ Error fetching companies:', companiesError.message);
      } else {
        console.log('✅ Successfully fetched companies:', companiesData?.length || 0, 'records');
      }
    }
  }
  
  console.log('\n✨ Dashboard query test completed successfully!');
}

async function testLogin() {
  console.log('\nTesting login flow...\n');
  
  // You can replace these with test credentials
  const testEmail = 'test@example.com';
  
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('email', testEmail)
    .single();

  if (error) {
    console.log('⚠️  No test company found or error:', error.message);
  } else {
    console.log('✅ Successfully fetched company data for login');
  }
}

// Run tests
console.log('🔧 Testing Supabase queries after fix...\n');
console.log('=====================================\n');

testDashboardQuery()
  .then(() => testLogin())
  .catch(console.error);