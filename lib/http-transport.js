'use sctrict';

var http = require('http');
var connect = require('connect');
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

  app.use(timeout(config));
  app.use(function(req, res, next) {
    var buf = [];
    req.setEncoding('utf8')
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
      var err = new Error();
      if (res.statusCode === 500 || res.statusCode === 503) {
        var errorData = JSON.parse(data) || {};
        _.extend(err, errorData, true);
        return callback(err);
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

  // if request is type POST|config.transport.method and on /exec|config.transport.path url then parse the data and handle it
  if (req.url.indexOf(config.transport.path) !== -1 && req.method.toLowerCase() === config.transport.method.toLowerCase() ) {
    return self.app.exec(req.body, function(err, out) {
      if (err) {
        return handleError.call(self, err, req, res);
      }

      sendResponse(res, out || null, { statusCode: 200 });
    });
  }

  // default action for the rest of requests
  sendResponse(res, { message: 'To call an action use '+config.transport.path }, { statusCode: 200 });
}

function handleError(err, req, res) {
  var self = this;
  var config = self.app.config;

  if (!err.toJSON) {
    err.toJSON = function() {
      var obj = _.pick(err, Object.keys(err));

      return obj;
    }
  }

  sendResponse(res, err, { statusCode: 500 });
}

function timeout(opts) {
  return function(req, res, next) {
    var id = setTimeout(function () {
      sendResponse(res, { 'code': 'ETIMEDOUT' }, { statusCode: 503 });
    }, opts.timeout || 5000);

    function clearTimeoutId() {
      clearTimeout(id);
    }

    req.once('close', clearTimeoutId);
    req.once('error', clearTimeoutId);
    res.once('error', clearTimeoutId);
    res.socket.once('data', clearTimeoutId);

    next();
  };
}

function sendResponse(res, data, opts) {
  var statusCode = (opts) ? opts.statusCode : 200;
  var body = JSON.stringify(data);
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  };

  res.writeHead(statusCode, headers);
  res.end(body);
}
