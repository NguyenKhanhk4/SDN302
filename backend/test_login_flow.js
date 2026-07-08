const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Capture network responses
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    // Only log API requests or redirects
    if (url.includes('/api/') || status >= 300) {
      console.log(`[NETWORK] ${status} ${url}`);
    }
  });

  console.log('Navigating to http://localhost:5173/login ...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  // Wait for email input
  await page.waitForSelector('input[name="email"]');
  console.log('Typing credentials...');
  
  // Using the known student account
  await page.type('input[name="email"]', 'admin@gmail.com');
  await page.type('input[name="password"]', '123456');
  
  // Click login button
  console.log('Clicking login...');
  await page.click('button[type="submit"]');

  // Wait for 5 seconds to see what happens
  console.log('Waiting for navigation/redirects...');
  await new Promise(r => setTimeout(r, 5000));

  const finalUrl = page.url();
  console.log('Final URL after 5 seconds:', finalUrl);
  
  // Get localStorage content
  const ls = await page.evaluate(() => {
    return {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user')
    };
  });
  console.log('LocalStorage state:', JSON.stringify(ls, null, 2));

  await browser.close();
})();
