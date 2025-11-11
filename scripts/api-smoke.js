import dotenv from 'dotenv';
dotenv.config();

// Node 18+ provides global fetch. Use it directly.
const BASE = process.env.API_BASE || 'http://localhost:3001';

async function main(){
  try{
    const t = Date.now();
    const email = `smoke+${t}@example.com`;
    const password = 'SmokePass123!';
    console.log('Registering', email);
    const reg = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Smoke Tester' })
    });
    const regJson = await reg.json();
    if (!reg.ok) throw new Error('Register failed: ' + JSON.stringify(regJson));
    console.log('Register OK', regJson);

    console.log('Logging in');
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await login.json();
    if (!login.ok) throw new Error('Login failed: ' + JSON.stringify(loginJson));
    console.log('Login OK', { token: Boolean(loginJson.token), roomId: loginJson.roomId });

    console.log('Creating room');
    const create = await fetch(`${BASE}/api/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', token: loginJson.token },
      body: JSON.stringify({})
    });
    const createJson = await create.json();
    if (!create.ok) throw new Error('Create room failed: ' + JSON.stringify(createJson));
    console.log('Create room OK', createJson);

    console.log('Smoke test passed');
    // give node a short moment to close any pending handles on Windows to avoid libuv assertions
    setTimeout(() => process.exit(0), 100);
  }catch(err){
    console.error('Smoke test failed:', err);
    setTimeout(() => process.exit(2), 100);
  }
}

main();
