var PORT = process.env.PORT || 3000;
var HOSTNAME = process.env.IP || 'localhost';

var quark = require('../index')();

quark.define({
  action: 'ping'
}, function(args, done) {
  done(null, { yeld: 'pong' });
});

quark.listen({ port: PORT, hostname: HOSTNAME }, function(err, addr) {
  if (err) throw err;

  console.log('quark %s service is running on %s:%s', 'ping.pong', addr.address, addr.port);
});
