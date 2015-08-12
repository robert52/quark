var request = require('request');
var should = require('should');
var Quark = require('..');
var quark = Quark();

describe('#define()', function() {
  before(function(done) {
    quark.define({
      action: 'ping'
    }, function(args, callback) {
      callback();
    });

    done();
  });

  it('should not register a null pattern', function(done) {
    try {
      quark.define(null, function() {});
    } catch(err) {
      should.exist(err);
      err.message.should.equal('Pattern cannot be null');
      done();
    }
  });

  it('should not register the same two patterns', function(done) {
    try {
      quark.define({
        action: 'ping'
      }, function() {});
    } catch(err) {
      should.exist(err);
      err.message.should.equal('The given pattern ({"action":"ping"}) has already been registered');
      done();
    }
  });

  it('should not register the a pattern without an action', function(done) {
    try {
      quark.define({
        action: 'pong'
      });
    } catch(err) {
      should.exist(err);
      err.message.should.equal('.define() requires callback function but got a [object Undefined]');
      done();
    }
  });
});
