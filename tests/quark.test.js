var request = require('request');
var should = require('should');
var Quark = require('..');

describe('quark', function() {
  describe('#listen()', function() {
    var quark = Quark();

    after(function(done) {
      quark.close(function() {
        done();
      });
    })

    it('should start listening for http request by default', function(done) {
      quark.listen(function(err, addr) {
        if (err) throw err;

        request({
          url: 'http://127.0.0.1:3000/',
          method: 'GET',
          json: true
        }, function(err, res, body) {
          if (err) throw err;

          body.message.should.equal('To call an action use /exec');
          done();
        });
      });
    });
  });

  describe('#exec() - internal', function() {
    var quark = Quark();

    before(function(done) {
      quark.define({
        action: 'ping'
      }, function(args, callback) {
        callback(null, {
          yeld: 'pong'
        });
      });

      done();
    });

    it('should execute an action and return a response', function(done) {
      quark.exec({
        action: 'ping'
      }, function(err, result) {
        if (err) throw err;

        should.exist(result);
        result.yeld.should.equal('pong');
        done();
      })
    });
  });

  describe('#exec() - through HTTP transport', function() {
    var quark = Quark();

    before(function(done) {
      quark.define({
        action: 'ping'
      }, function(args, callback) {
        callback(null, args);
      });

      quark.listen(function(err, addr) {
        if (err) throw err;

        done();
      });
    })

    after(function(done) {
      quark.close(function() {
        done();
      });
    })

    it('should execute an action and return a response', function(done) {
      var _specialString = 'ăâĂâ«€©Đ±”';

      request({
        url: 'http://127.0.0.1:3000/exec',
        method: 'POST',
        body: {
          action: 'ping',
          special: _specialString,
        },
        json: true
      }, function(err, res, body) {
        if (err) throw err;

        res.statusCode.should.equal(200);
        should.exist(body);
        body.action.should.equal('ping');
        body.special.should.equal(_specialString);
        done();
      });
    });
  });
});
