const http = require('http');

const testPasswordChange = async () => {
  try {
    console.log('1. Logging in as admin...');
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: '123456' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Admin login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('Admin login successful.');

    console.log('\n2. Fetching users list...');
    const usersRes = await fetch('http://127.0.0.1:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    if (!usersData.success) {
      console.error('Failed to get users:', usersData);
      return;
    }
    
    // Pick the first student user
    const usersArray = usersData.data.users || usersData.data;
    const targetUser = Array.isArray(usersArray) ? usersArray.find(u => u.role === 'student' || u.role === 'STUDENT') : null;
    if (!targetUser) {
      console.log('No student user found to test on.');
      return;
    }
    console.log(`Selected target user: ${targetUser.email} (ID: ${targetUser._id})`);

    console.log('\n3. Changing password to "111111"...');
    const changeRes = await fetch(`http://127.0.0.1:5000/api/admin/users/${targetUser._id}/password`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ password: '111111' })
    });
    const changeData = await changeRes.json();
    console.log('Change password response:', changeData);
    if (!changeData.success) return;

    console.log(`\n4. Trying to login as ${targetUser.email} with new password "111111"...`);
    const userLoginRes1 = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetUser.email, password: '111111' })
    });
    const userLoginData1 = await userLoginRes1.json();
    console.log('Login result:', userLoginData1.success ? 'SUCCESS' : 'FAILED - ' + userLoginData1.message);

    console.log('\n5. Restoring password back to "123456"...');
    const restoreRes = await fetch(`http://127.0.0.1:5000/api/admin/users/${targetUser._id}/password`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ password: '123456' })
    });
    const restoreData = await restoreRes.json();
    console.log('Restore password response:', restoreData);

    console.log(`\n6. Trying to login as ${targetUser.email} with restored password "123456"...`);
    const userLoginRes2 = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetUser.email, password: '123456' })
    });
    const userLoginData2 = await userLoginRes2.json();
    console.log('Login result:', userLoginData2.success ? 'SUCCESS' : 'FAILED - ' + userLoginData2.message);

  } catch (error) {
    console.error('Test error:', error);
  }
};

testPasswordChange();
