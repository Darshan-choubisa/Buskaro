const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.resolveSrv('_mongodb._tcp.cluster0.ahfgvsw.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV lookup failed with Google DNS:', err);
  } else {
    console.log('SRV addresses with Google DNS:', addresses);
  }
});
