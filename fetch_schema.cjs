const https = require('https');

const data = JSON.stringify({
  query: "query { __type(name: \"Mutation\") { fields { name args { name type { name kind ofType { name kind } } } } } }"
});

const options = {
  hostname: 'localhost',
  port: 44361,
  path: '/graphql/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  },
  rejectUnauthorized: false
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
     const json = JSON.parse(body);
     const updateVehicle = json.data.__type.fields.find(f => f.name === 'updateVehicle');
     console.log(JSON.stringify(updateVehicle.args.find(a => a.name === 'status'), null, 2));
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
