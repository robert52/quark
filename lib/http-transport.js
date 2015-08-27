'use sctrict';

var http = require('http');
var connect = require('connect');
var timeout = require('connect-timeout');
var _ = require('lodash');

/**
 *  Module exports
 *  @public
 */
module.exports = HttpTransport;

function HttpTransport() {}

/**
 *  Create a server that listens on a given address
 *
 *  @param {Object} opts
 *  @param {Function} callback
 *  @public
 */
HttpTransport.prototype.listen = function(opts, callback) {
  callback = callback || function() {};

  var self = this;
  var app = connect();
  var server;
  var config = _.extend(self.app.config.transport, opts);

  app.use(timeout(config.timeout));
  app.use(function(req, res, next) {
    var buf = [];
    req.on('data', function(chunk) {
      buf.push(chunk);
    });
    req.on('end', function() {
      var data = buf.join('');

      if (data.length < 0) {
        req.body = {};
        return next();
      }

      try {
        req.body = JSON.parse(data);
      } catch (err) {
        req.body = {};
      }

      next();
    });
  });
  app.use(handleRequest.bind(this));

  server = http.createServer(app);

  this.server = server;

  server.listen(config.port || 3000, config.hostname || "0.0.0.0", function() {
    callback(null, server.address());
  });
};

/**
 *  Close the transport
 *
 *  @param {Function} callback
 *  @public
 */
HttpTransport.prototype.close = function(callback) {
  this.server.close(callback);
}

/**
 *  How to handle incoming requests
 *
 *  @param {Object} req
 *  @param {Object} res
 *  @private
 */
function handleRequest(req, res) {
  var self = this;
  var config = self.app.config;
  var message;
  var headers = {
    'Content-Type': 'application/json'
  };

  // if request is type POST|config.transport.method and on /exec|config.transport.path url then parse the data and handle it
  if (req.url.indexOf(config.transport.path) !== -1 && req.method.toLowerCase() === config.transport.method.toLowerCase() ) {
    return self.app.exec(req.body, function(err, out) {
      var body = 'null';

      if (err) {
        return handleError.call(self, err, req, res);
      }

      if (out != null) {
        body = JSON.stringify(out);
      }

      headers['Content-Length'] = Buffer.byteLength(body);
      res.writeHead(200, headers);
      res.end(body);
    });
  }

  message = JSON.stringify({ message: 'To call an action use ' + config.transport.path });
  // default action for the rest of requests
  headers['Content-Length'] = Buffer.byteLength(message);
  res.writeHead(200, headers);
  res.end(message);
}

function handleError(err, req, res) {
  var self = this;
  var config = self.app.config;
  var body = '';
  var headers = {
    'Content-Type': 'application/json'
  };

  if (!err.toJSON) {
    err.toJSON = function() {
      var obj = _.pick(err, Object.keys(err));

      return obj;
    }
  }

  body = JSON.stringify(err);

  headers['Content-Length'] = Buffer.byteLength(body);
  res.writeHead(500, headers);

  return res.end(body);
}

/**
 *  Send a request to a remote client
 *
 *  @param {Object} opts
 *  @param {Object} args - arguments to send
 *  @param {Function} callback
 *  @private
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
      if (res.statusCode === 500) {
        return callback(JSON.parse(data));
      }

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
