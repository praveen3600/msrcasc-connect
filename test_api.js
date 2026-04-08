fetch('https://msrcasc-connect-api.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'test', email: 'test135@example.com', password: 'password123', role: 'student' })
}).then(r => r.json()).then(console.log).catch(console.error);
