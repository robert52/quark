'user strict';

var _ = require("lodash");
var patrun = require("patrun");
var HttpTransport = require('./http-transport');

function Core() {
  this._localpat = patrun();
  this._remotepat = patrun();
  this._transports = {};

  //HttpTransport.call(this);
  this._transports.http = new HttpTransport();
  this._transports.http.app = this;
}

/**
 * Listen for connections for a specified transport,
 * built in transports are: http
 *
 * @param {Object} opts
 * @return {app} for chaining
 * @public
 */
Core.prototype.listen = function(opts, callback) {
  opts.type = opts.type || this.config.transport.type;

  // TODO: add more friendly errors
  try {
    this._transports[opts.type].listen(opts, callback)
  } catch(err) {
    callback(err);
  }

  return this;
};

/**
 * Register a function for a given pattern
 *
 * @param {Object} pattern
 * @param {Function} handle
 * @return {app} for chaining
 * @public
 */
Core.prototype.define = function(pattern, handle) {
  if (typeof handle !== 'function') {
    var type = Object.prototype.toString.call(handle);
    var msg = '.define() requires callback function but got a ' + type;
    throw new Error(msg);
  }

  this._localpat.add(pattern, handle);
};

/**
 * Find a pattern
 * @private
 */
Core.prototype._find = function(pattern) {
  var fn = this._localpat.find(pattern);

  if (!fn) {
    fn = this._remotepat.find(pattern);
  }

  return fn;
};

/*
 * Execute a function for a pattern
 * @param {Object} args - pattern
 * @param {Function} callback
 * @return {app} for chaining
 * @public
 */
Core.prototype.exec = function(args, callback) {
  var handle = this._find(args);

  if (!handle) {
    var err = new Error('No handle found');
    return callback(err);
  }

  handle(args, callback);

  return this;
};

/**
 * Send a remote call
 * @private
 */
Core.prototype._send = function(opts, args, callback) {
  if (!this._transports[opts.type]) {
    var err = new Error('No transport found');
    err.type = 'no_transport_found';
    return callback(err);
  }

  this._transports[opts.type].send(opts, args, callback);
};

/*
 * Define a client for a pattern and make calls to it
 * @public
 */
Core.prototype.client = function(opts, pattern) {
  var self = this;
  opts = _.extend({}, self.config.transport, opts);

  this._remotepat.add(pattern, function(args, callback) {
    self._send(opts, args, callback);
  });

  return this;
};

/*
 * Use a service
 *
 * for now just local
 * use .client() to define a remote service
 * @public
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

module.exports = Core;
