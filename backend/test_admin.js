const axios = require('axios');

(async () => {
  try {
    console.log('Logging in as admin...');
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: '123456'
    });
    
    console.log('Login success:', loginRes.data.success);
    const token = loginRes.data.token;
    
    console.log('Fetching admin dashboard...');
    try {
      const dashRes = await axios.get('http://127.0.0.1:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Dashboard status:', dashRes.status);
    } catch(e) {
      console.log('Dashboard error:', e.response?.status);
    }

    console.log('Fetching enrollment trends...');
    try {
      const trendRes = await axios.get('http://127.0.0.1:5000/api/report/trends/enrollment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Trends status:', trendRes.status);
    } catch(e) {
      console.log('Trends error:', e.response?.status);
    }
    
  } catch (err) {
    console.log('Global Error:', err.message);
  }
})();
