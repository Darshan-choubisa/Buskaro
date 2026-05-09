const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.ahfgvsw.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV lookup failed:', err);
  } else {
    console.log('SRV addresses:', addresses);
  }
});
