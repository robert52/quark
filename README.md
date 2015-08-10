# quark

a mini framework for micro-service in node.js

## Installation

```bash
$ npm install quarkjs
```

## Features

* Simple definition of actions for patterns.
* Fast and minimalist.
* Transports will resolve message sending to other services.

## Quick start

```bash
$ npm install quarkjs
```

__Example of a ping-pong app:__

```javascript
var quarkjs = require('quarkjs')();

quarkjs.define({
  action: 'ping'
}, function(args, done) {
  done(null, { yeld: 'pong' });
});

quarkjs.listen(function(err, addr) {
  if (err) throw err;

  console.log('quarkjs %s is running on %s:%s', 'ping.pong', addr.address, addr.port);
});

// by default quarkjs will start using the http transport on http://localhost:3000

```
__Sending messages:__

```bash
$ curl -H "Content-Type: application/json" -X POST -d '{"action":"ping"}' http://localhost:3000/exec

# output => { "yeld": "pong" }
```

## Examples

To view the examples, clone the [quark](https://github.com/robert52/quark) repository and install the dependencies.

```bash
$ git clone git@github.com:robert52/quark.git
$ cd quark
$ npm install
```

To run an example us the following command:

```bash
$ node examples/ping.pong.js
```

## License

[MIT](https://github.com/robert52/quark/blob/master/LICENSE)
