'user strict';

var _ = require("lodash");
var patrun = require("patrun");
var HttpTransport = require('./http-transport');

/**
 *  Module exports
 *
 *  @public
 */
module.exports = Core;

function Core() {
  this._localpat = patrun();
  this._remotepat = patrun();
  this._transports = {};

  //HttpTransport.call(this);
  this._transports.http = new HttpTransport();
  this._transports.http.app = this;
}

/**
 *  Listen for connections for a specified transport,
 *  built in transports are: http
 *
 *  @param {Object} opts
 *  @return {app} for chaining
 *  @public
 */
Core.prototype.listen = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var config = _.extend({}, this.config.transport, opts);

  // TODO: add more friendly errors
  try {
    this._transports[config.type].listen(config, callback)
  } catch(err) {
    callback(err);
  }

  return this;
};

Core.prototype.close = function(callback) {
  this._transports['http'].close(callback);

  return this;
};

/**
 *  Register a function for a given pattern
 *
 *  @param {Object} pattern
 *  @param {Function} handle
 *  @return {app} for chaining
 *  @public
 */
Core.prototype.define = function(pattern, handle) {
  var errorMsg;

  if (pattern === null) {
    throw error('pattern_null');
  }

  if (typeof pattern !== 'object') {
    errorMsg = 'The provided pattern should be an object but got instead: ' + (typeof pattern);
  }

  if (typeof handle !== 'function') {
    var type = Object.prototype.toString.call(handle);
    errorMsg = '.define() requires callback function but got a ' + type;
  }

  if (this._localpat.find(pattern, true) !== null) {
    errorMsg = 'The given pattern (' + JSON.stringify(pattern) + ') has already been registered';
  }

  if (errorMsg) {
    throw new Error(errorMsg);
  }

  this._localpat.add(pattern, handle);
};

/**
 *  Find a pattern
 *  @private
 */
Core.prototype._find = function(pattern) {
  var fn = this._localpat.find(pattern);

  if (!fn) {
    fn = this._remotepat.find(pattern);
  }

  return fn;
};

/**
 *  Execute a function for a pattern
 *  @param {Object} args - pattern
 *  @param {Function} callback
 *  @return {app} for chaining
 *  @public
 */
Core.prototype.exec = function(args, callback) {
  var handle = this._find(args);

  if (!handle) {
    return callback(error('no_handle_found'));
  }

  handle.call(this, args, callback);

  return this;
};

/**
 * Send a remote call
 *
 * @param {Object} opts
 * @param {Object} args - arguments to send through transport
 * @param {Function} callback
 * @return {app} for chaining
 * @private
 */
Core.prototype._send = function(opts, args, callback) {
  if (!this._transports[opts.type]) {
    return callback(error('no_transport_found'));
  }

  this._transports[opts.type].send(opts, args, callback);

  return this;
};

/**
 *  Define a client for a pattern and make calls to it
 *
 *  @param {Object} opts - options for client
 *  @param {Object} pattern
 *  @return {app} for chaining
 *  @public
 */
Core.prototype.client = function(opts, pattern) {
  var self = this;
  opts = _.extend({}, self.config.transport, opts);

  this._remotepat.add(pattern, function(args, callback) {
    self._send(opts, args, callback);
  });

  return this;
};

/**
 *  Use a service
 *
 *  for now just local
 *  use .client() to define a remote service
 *
 *  @param {Object} service - an existing instance
 *  @return {app} for chaining
 *  @public
 */
Core.prototype.use = function(service) {
  var self = this;
  var local = _.clone(service._localpat.list());
  var remote = _.clone(service._remotepat.list());

  _.forEach(local, function(p) {
    self._localpat.add(p.match, p.data);
  });

  _.forEach(remote, function(p) {
    self._remotepat.add(p.match, p.data);
  });

  return this;
};

function error(type) {
  var map = ErrorMap()[type];
  var err = new Error();
  err.type = type;
  err.message = map;
  err.error = true;

  return err;
}

function ErrorMap() {
  return {
    pattern_null: 'Pattern cannot be null',
    no_handle_found: 'No handle fund',
    no_transport_found: 'No transport found'
  };
}
