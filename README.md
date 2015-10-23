# quark

a mini framework for micro-service in node.js

![npm version](https://badge.fury.io/js/quark.svg)

## Installation

```bash
$ npm install quark
```

## Features

* Simple definition of actions for patterns.
* Fast and minimalist.
* Transports will resolve message sending to other services.

## Quick start

```bash
$ npm install quark
```

__Example of a ping-pong app:__

```javascript
var quark = require('quark')();

quark.define({
  action: 'ping'
}, function(args, done) {
  done(null, { yeld: 'pong' });
});

quark.listen(function(err, addr) {
  if (err) throw err;

  console.log('quark %s is running on %s:%s', 'ping.pong', addr.address, addr.port);
});
```
__Sending messages:__

```bash
$ curl -d "http://localhost:3000/exec" '{"action" : "ping"}'

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

## Test

To run tests, simply run the following command:

```bash
$ npm test
```

## When to use quark

- When you want to separate your monolithic application into small services.
- When you don't care who provides the functionality only the output of an action.
- When you don't know where the actual implementation lives (network, local).

We can communicate with each other through different channels, be it a simple conversation or in a chat room on the internet, the core message will get to the other person.

## License

[MIT](https://github.com/robert52/quark/blob/master/LICENSE)
