const fs = require('fs');
const path = require('path');

// Manually load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debugging: Log the environment variables to check if they are loaded
console.log('Supabase URL from env:', supabaseUrl);
console.log('Supabase Service Key from env:', supabaseKey ? 'Loaded' : 'Not Loaded');


if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is not configured correctly in .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestCompany() {
  console.log('Creating test company...');
  const uniqueEmail = `test-${Date.now()}@quram.com`;
  const companyData = {
    email: uniqueEmail,
    company_name: 'Quram Technologies',
    ceo_name: 'Test CEO',
    manager_name: 'Test Manager',
    manager_position: 'Business Development Manager',
    phone_number: '010-1234-5678',
    industry: 'Technology / AI & Deep Learning',
    headquarters_country: '한국',
    headquarters_city: '서울',
    founding_year: 2001,
    employee_count: '50-100',
    revenue_scale: '10억-50억',
    main_products: 'MI SSA (신분증 사본판별), MI ID (신분증 OCR 인식)',
    target_market: '금융기관, 핀테크, 정부기관',
    competitive_advantage: '18년간 삼성 모바일 이미지 처리 SW 개발, 99.53% 정확도의 국내 최고 인식률',
    company_vision: 'Smaller, Faster & Smarter for Developers - AI 기반 신분증 진위확인 솔루션',
    website: 'https://www.quram.com',
    is_approved: true, // Auto-approve for testing
    password: 'testpassword123' // Add dummy password
  };

  const { data, error } = await supabase
    .from('companies')
    .insert([companyData])
    .select()
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return null;
  }

  console.log('Test company created:', data.id);
  return data;
}

async function createMatchingRequest(companyId) {
  console.log('Creating matching request...');

  const matchingRequest = {
    company_id: companyId,
    target_countries: ['미국', '일본', '독일'],
    company_description: 'PDF 분석 테스트용으로 생성된 요청입니다.',
    product_info: 'Quram MI ID&SSA 솔루션 문서 기반',
    additional_questions: 'AI 분석이 정확하게 수행되는지, 특히 시장 조사 데이터가 최신 정보를 반영하는지 테스트하고 싶습니다.',
    status: 'pending',
    workflow_status: 'pending'
  };

  const { data, error } = await supabase
    .from('matching_requests')
    .insert([matchingRequest])
    .select()
    .single();

  if (error) {
    console.error('Error creating matching request:', error);
    return null;
  }

  console.log('Matching request created:', data.id);
  return data;
}

async function uploadPDF(companyId, matchingRequestId, pdfPath) {
  console.log('Uploading PDF document...');
  
  // Note: This is a mock upload since we can't directly upload from Node.js script
  // In real scenario, you would upload the PDF through the UI or using a proper file upload
  
  const pdfUpload = {
    matching_request_id: matchingRequestId,
    file_name: '큐램 MI ID&SSA(OCR, 사본판별) 6.pdf',
    file_url: `${companyId}/quram-mi-solution.pdf`, // Use file_url instead of file_path
    file_size: 123456 // Add a dummy file size
  };

  const { data, error } = await supabase
    .from('pdf_uploads')
    .insert([pdfUpload])
    .select()
    .single();

  if (error) {
    console.error('Error recording PDF upload:', error);
    return null;
  }

  console.log('PDF upload recorded:', data.id);
  return data;
}

async function triggerAnalysis(matchingRequestId) {
  console.log('Triggering AI analysis...');
  
  // Call the comprehensive-analysis edge function
  const { data, error } = await supabase.functions.invoke('comprehensive-analysis', {
    body: {
      matchingRequestId: matchingRequestId
    }
  });

  if (error) {
    console.error('Error triggering analysis:', error);
    return null;
  }

  console.log('Analysis triggered successfully');
  return data;
}

async function main() {
  console.log('=== Starting PDF Report Test ===\n');

  try {
    // Step 1: Create test company
    const company = await createTestCompany();
    if (!company) {
      console.error('Failed to create test company');
      return;
    }

    // Step 2: Create matching request
    const matchingRequest = await createMatchingRequest(company.id);
    if (!matchingRequest) {
      console.error('Failed to create matching request');
      return;
    }

    // Step 3: Record PDF upload
    const pdfUpload = await uploadPDF(company.id, matchingRequest.id, '/Users/startuperdaniel/Downloads/큐램 MI ID&SSA(OCR, 사본판별) 6.pdf');
    if (!pdfUpload) {
      console.error('Failed to record PDF upload');
      return;
    }

    // Step 4: Trigger AI analysis
    console.log('\n=== Triggering AI Analysis ===');
    console.log('This will generate a comprehensive report based on the Quram MI ID&SSA solution document');
    
    const analysisResult = await triggerAnalysis(matchingRequest.id);
    if (analysisResult) {
      console.log('\n✅ Test completed successfully!');
      console.log(`\nYou can now view the report in the Admin panel:`);
      console.log(`1. Go to http://localhost:8080/admin`);
      console.log(`2. Navigate to the "리포트 리뷰" tab`);
      console.log(`3. Find the report for Quram Technologies`);
      console.log(`\nMatching Request ID: ${matchingRequest.id}`);
      console.log(`Company ID: ${company.id}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
main();