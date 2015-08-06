var PORT = process.env.PORT || 3000;
var HOSTNAME = process.env.IP || 'localhost';

var quark = require('../../index')();

/**
 *  Mount local instances to the current quark instance
 *  all defined handles will be inherited
 */
quark.use(require('./apples'));
quark.use(require('./oranges'));
quark.use(require('./juice'));

quark.listen({ port: PORT, hostname: HOSTNAME }, function(err, addr) {
  if (err) throw err;

  console.log('quark %s service is running on %s:%s', 'container', addr.address, addr.port);
});
