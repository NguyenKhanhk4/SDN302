const http = require('http');

const testApi = async () => {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: '123456' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('Login successful. Token acquired.');

    const headers = { 'Authorization': `Bearer ${token}` };

    const endpoints = [
      { name: 'Users', url: 'http://localhost:5000/api/admin/users' },
      { name: 'Classes', url: 'http://localhost:5000/api/admin/classes' },
      { name: 'Subjects', url: 'http://localhost:5000/api/admin/subjects' },
      { name: 'Enrollments', url: 'http://localhost:5000/api/enrollment' },
      { name: 'Invoices', url: 'http://localhost:5000/api/finance/invoices' },
      { name: 'Receipts', url: 'http://localhost:5000/api/finance/receipts' },
      { name: 'Payrolls', url: 'http://localhost:5000/api/finance/payrolls' }
    ];

    for (const ep of endpoints) {
      console.log(`\n--- Testing ${ep.name} ---`);
      try {
        const res = await fetch(ep.url, { headers });
        const data = await res.json();
        if (data.success) {
          const arr = data.data || data[ep.name.toLowerCase()] || [];
          console.log(`Success! Fetched ${Array.isArray(arr) ? arr.length : 'non-array'} items.`);
          if (Array.isArray(arr) && arr.length > 0) {
            console.log('First item structure:');
            console.log(JSON.stringify(arr[0], null, 2).substring(0, 500) + '...');
          } else {
             console.log('Data returned:', Object.keys(data));
             if(data.data) console.log(JSON.stringify(data.data).substring(0, 200));
          }
        } else {
          console.error(`API Error for ${ep.name}:`, data);
        }
      } catch (err) {
        console.error(`Fetch Error for ${ep.name}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Global error:', error);
  }
};

testApi();
