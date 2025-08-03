import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function captureServiceScreens() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Create directory for screenshots
  const screenshotDir = './public/service-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('📸 Starting service screen capture...\n');

    // Step 1: Auth/Registration Page
    console.log('1️⃣ Capturing registration page...');
    await page.goto('http://localhost:8080/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'step1-registration.png'),
      fullPage: false
    });

    // Step 2: Business Documents Page (simulate logged in state)
    console.log('2️⃣ Capturing business documents page...');
    await page.goto('http://localhost:8080/business-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // If redirected to auth, capture the auth page in registration mode
    if (page.url().includes('/auth')) {
      // Click on registration tab if available
      const registerTab = page.locator('button:has-text("회원가입")').first();
      if (await registerTab.count() > 0) {
        await registerTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'step2-documents.png'),
      fullPage: false
    });

    // Step 3: Matching Request Page
    console.log('3️⃣ Capturing matching request page...');
    await page.goto('http://localhost:8080/matching-request');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'step3-analysis.png'),
      fullPage: false
    });

    // Step 4: Dashboard/Results Page
    console.log('4️⃣ Capturing dashboard page...');
    await page.goto('http://localhost:8080/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'step4-results.png'),
      fullPage: false
    });

    // Admin Page
    console.log('5️⃣ Capturing admin page...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'admin-panel.png'),
      fullPage: false
    });

    // Homepage for reference
    console.log('6️⃣ Capturing homepage...');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'homepage.png'),
      fullPage: false
    });

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the capture
captureServiceScreens().catch(console.error);