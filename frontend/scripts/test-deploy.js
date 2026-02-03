const axios = require('axios');

async function test(url) {
  try {
    console.log(`Testing ${url}`);
    const res = await axios.get(url, { timeout: 10000 });
    console.log(`  -> ${url} status: ${res.status}`);
    if (res && res.data) {
      const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      console.log('  -> response body (truncated 200 chars):', body.slice(0, 200));
    }
  } catch (err) {
    if (err.response) {
      console.log(`  -> ${url} status: ${err.response.status}`);
      try {
        const body = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        console.log('  -> error body (truncated 400 chars):', body.slice(0, 400));
      } catch (e) {
        console.log('  -> error body: <unavailable>');
      }
    } else {
      console.log(`  -> ${url} error: ${err.message}`);
    }
  }
}

async function main() {
  const base = process.argv[2];
  if (!base) {
    console.error('Usage: node scripts/test-deploy.js <BASE_URL>');
    process.exit(1);
  }

  const urls = [
    `${base}`,
    `${base}/dashboard`,
    `${base}/discover`,
  ];

  for (const u of urls) {
    // small delay between requests
    // eslint-disable-next-line no-await-in-loop
    await test(u);
  }
}

main();
