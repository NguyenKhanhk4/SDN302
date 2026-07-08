const axios = require('axios');

(async () => {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ngocnhi00@gmail.com',
      password: '123456'
    });
    
    console.log('Login success:', loginRes.data.success);
    const token = loginRes.data.token;
    
    console.log('Fetching student dashboard...');
    const dashRes = await axios.get('http://localhost:5000/api/student/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Dashboard success:', dashRes.data.success);
    
  } catch (err) {
    if (err.response) {
      console.log('Error status:', err.response.status);
      console.log('Error data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
})();
