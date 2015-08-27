var request = require('request');
var should = require('should');
var Quark = require('..');
var quark = Quark();
var client = Quark();

var clientConfig = {
  hostname: 'localhost',
  port: 3001
};

describe('#client()', function() {
  before(function(done) {
    client.define({
      action: 'ping'
    }, function(args, callback) {
      callback(null, { yeld: 'pong' });
    });

    client.define({
      action: 'ping',
      type: 'error'
    }, function(args, callback) {
      var err = new Error();
      err.error = 'ping_error';
      err.summary = 'Just an error summary.';
      callback(err);
    });

    quark.listen(function(err, addr) {
      if (err) throw err;

      quark.client(clientConfig, { action: 'ping' });

      client.listen(clientConfig, function(err, addr) {
        if (err) throw err;

        done();
      })
    });
  });

  after(function(done) {
    quark.close(function() {
      client.close(function() {
        done();
      });
    });
  });

  it('should execute a remote action called locally', function(done) {
    quark.exec({
      action: 'ping'
    }, function(err, result) {
      if (err) throw err;

      should.exist(result);
      result.yeld.should.equal('pong');
      done();
    });
  });

  it('should expose remote action', function(done) {
    request({
      url: 'http://127.0.0.1:3000/exec',
      method: 'POST',
      body: {
        action: 'ping'
      },
      json: true
    }, function(err, res, body) {
      if (err) throw err;

      res.statusCode.should.equal(200);
      should.exist(body);
      body.yeld.should.equal('pong');
      done();
    });
  });

  it('should handle error for a remote action', function(done) {
    quark.exec({
      action: 'ping',
      type: 'error'
    }, function(err, result) {
      should.exist(err);
      should.not.exist(result);
      err.error.should.equal('ping_error');
      err.summary.should.equal('Just an error summary.');
      done();
    });
  });
});
