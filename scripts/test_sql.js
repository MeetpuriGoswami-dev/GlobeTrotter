const projectId = 'qfevnplojsffbdqbdcfh';
const token = process.env.SUPABASE_ACCESS_TOKEN || 'your_token_here';
const query = 'SELECT 1;';

async function run() {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    const data = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Data: ${data}`);
  } catch(e) {
    console.error(e);
  }
}
run();
