var PORT = process.env.PORT || 3000;
var HOSTNAME = process.env.IP || 'localhost';
var SERVICE_PORT = process.env.SERVICE_PORT || 3001;
var SERVICE_HOST = process.env.SERVICE_HOST || 'localhost';

var quark = require('../../index')();

quark.client({
  hostname: SERVICE_HOST,
  port: SERVICE_PORT
}, {
  action: 'ping'
});

quark.listen({ port: PORT, hostname: HOSTNAME }, function(err, addr) {
  if (err) throw err;

  console.log('quark %s service is running on %s:%s', 'ping.pong', addr.address, addr.port);
});
