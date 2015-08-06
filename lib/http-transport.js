'use sctrict';

var http = require('http');
var connect = require('connect');
var timeout = require('connect-timeout');
var bodyParser = require('body-parser');
var _ = require('lodash');

/**
 *  Module exports
 *  @public
 */
module.exports = HttpTransport;

function HttpTransport() {}

/**
 * Create a server that listens on a given address
 *
 * @param {Object}
 * @private
 */
HttpTransport.prototype.listen = function(opts, callback) {
  callback = callback || function() {};

  var self = this;
  var app = connect();
  var server;

  app.use(timeout(opts.timeout));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(handleRequest.bind(this));

  server = http.createServer(app);

  this.server = server;

  server.listen(opts.port || 3000, opts.hostname || "0.0.0.0", function() {
    callback(null, server.address());
  });
};

HttpTransport.prototype.close = function(callback) {
  this.server.close(callback);
}

function handleRequest(req, res) {
  var self = this;
  var config = self.app.config;
  var message;

  // if request is type POST|config.transport.method and on /exec|config.transport.path url then parse the data and handle it
  if (req.url.indexOf(config.transport.path) !== -1 && req.method.toLowerCase() === config.transport.method.toLowerCase() ) {
    return self.app.exec(req.body, function(err, out) {
      var body = '';

      if (err) {
        body = JSON.stringify(err, Object.keys(err));

        res.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'application/json'
        });

        return res.end(body);
      }

      body = JSON.stringify(out);

      res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'application/json'
      });
      res.end(body);
    });
  }

  message = JSON.stringify({ message: 'To call an action use ' + config.transport.path });
  // default action for the rest of requests
  res.writeHead(200, {
    'Content-Length': message.length,
    'Content-Type': 'application/json'
  });
  res.end(message);
}

/**
 * Send a request to a remote client
 * @private
 */
HttpTransport.prototype.send = function(opts, args, callback) {
  args = args || {};
  var data = '';
  var reqOpts = _.clone(opts, true);

  var req = http.request(reqOpts, function(res) {
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      callback(null, JSON.parse(data));
    });
    res.on('error', function(err) {
      callback(err);
    });
  });

  req.on('error', function(err) {
    callback(err);
  });

  req.write(JSON.stringify(args));
  req.end();
};
