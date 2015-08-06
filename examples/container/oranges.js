var quark = require('../../index')();

/**
 *  Define some actions
 */

quark.define({
  entity: 'oranges'
}, function(args, callback) {

  /**
   *  Do some things here
   */

  args.message = 'Take some, ' + args.entity;


  /**
   *  Execute `done` by sending an error or message object
   */
  callback(null, args);
});

/**
 *  Export the current instance
 */

module.exports = quark;
