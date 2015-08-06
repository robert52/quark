var quark = require('../../index')();

/**
 *  Define some actions
 */
quark.define({
  entity: 'juice',
  type: 'apple'
}, function(args, callback) {
  var self = this;
  // do some things here ...

  // execute something for a pattern
  self.exec({
    entity: 'apples'
  }, function(err, result) {
    console.log('apples');

    if (err) {
      return callback(err);
    }

    var juice = {
      message: result.message,
      from: 'juice',
      type: 'apple'
    };

    callback(null, juice);
  });
});

quark.define({
  entity: 'juice',
  type: 'orange'
}, function(args, callback) {
  var self = this;
  // do some things here ...

  // execute something for a pattern
  self.exec({
    entity: 'oranges'
  }, function(err, result) {
    if (err) {
      return callback(err);
    }

    var juice = {
      message: result.message,
      from: 'juice',
      type: 'orange'
    };

    callback(null, juice);
  });
});

/**
 *  Export the current instance
 */

module.exports = quark;
