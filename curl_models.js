const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        json.models.forEach(m => console.log(m.name));
      } else {
        console.log(json);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
