'use strict';

var _ = require('lodash');
var Core = require('./lib/core');

function Quark(opts) {
  this.defaults = {
    transport: {
      type: 'http',
      port: 3000,
      hostname: "localhost",
      method: "POST",
      path: '/exec',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  };

  this.config = _.extend({}, this.defaults, opts);
  Core.call(this);
}

_.extend(Quark.prototype, Core.prototype);

module.exports = function build(opts) {
  return new Quark(opts);
};
