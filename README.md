# krilljs

krilljs is your microservice adapter library and framework.
[![CircleCI](https://circleci.com/gh/kugtong33/krill/tree/master.svg?style=svg)](https://circleci.com/gh/kugtong33/krill/tree/master)

## the microservice structure
```
/* the file structure of a simple microservice */

src
  |_ config
  |_ policies
  |_ resources
  |_ schema
  |_ index.js
```

The `config` folder contains the service's configuration and is more explained in the next section, the configurations are
declaratively structured for convenience.

The `policies` folder contains all route polices, for now it only support koa endpoints, policies are executed after the
middlewares whenever a koa endpoint is called.

The `resources` folder contains all the __endpoint resources__, a __resource__ is a function which is used to manage data
models, composes multiple requests, reroute protocols (i.e. from http to amqp), in other words this is were the logic happens.

The `schema` folder contains all the schema definition rules and json objects will be checked using the __ajv__  library, for
how to do a json schema rule, visit __ajv__ for more information. You use the schema checker using the global `Util.validate`
method, call `Util.validate('mySchema', object);`

The `index.js` is the starting point of the microservice, by calling it using the `node` command the service starts up and loads
the enabled adapters.

## the configuration structure
```
/* the file structure of a microservice configuration */

config
  |_ adapters.js
  |_ bootloaders.js
  |_ middlewares.js
  |_ policies.js
  |_ routes.js
```

The `adapters.js` enables or disables an adapter or not, the configuration is a list, adapters that are on the list will be
the only ones started upon service start.

```javascript
/* adapters.js */

/* to disable, just remove the adapter name from the list */
export default ['koa', 'rabbit', 'redis', 'couchbase', 'sendgrid'];
```

The `bootloaders.js` is a list of functions that are called first when a microservice starts.

```javascript
/* bootloaders.js */

export default [
  function load() {
    /* load routes */
    global.Routes = require('./routes').default;

    /* load resources */
    Util.require('resources', 'Resources');
  },
  function customLoader() { /* put your bootloader here */ },
  /* you can add more bootloaders also */
];
```

The `middlewares.js` is a list of function that are called sequentially when an endpoint is called but it only supports koa
as of this writing. Middlewares is good for endpoint logging, api analytics, checking api rate limit etc.

```javascript
/* middlewares.js */

export default [
  function async logger(ctx, next) {
    try {
      const { headers, body } = ctx.request;
      debug({ headers, body });

      await next();
    } catch (err) { debug(err); }
  },
  function async customMiddleware() { /* put your custom middleware here */ },
  /* you can also add more middlewares */
];
```

The `policies.js` is an object which maps the policy functions to a resource endpoint function, policies are called just before
the endpoint function itself.

```javascript
/* policies.js */

export default {
  AccountResource: {
    auth: ['validBasicString', 'validRefreshToken']
  },
  /* you can also map more policies to resources here */
};
```

The `routes.js` contains the endpoint definition (endpoint type, attached resource function and api path).

```javascript
/* routes.js */

export default [
  { type: 'http', api: 'post /v1/auth', resource: 'OAuthResource.auth' },
  { type: 'http', api: 'delete /v1/auth', resource: 'OAuthResource.revoke' },
  /* you can add more route definitions here */
];
```

## koa adapter

The koa adapter uses `koa version 2.x.x` that uses async/await on its stack.

To make the koa adapter working, first ensure that the required files are present, and it is enabled
in the `adapters.js` configuration file.

```
/* requires files */

src
  |_ config
        |_ routes.js
        |_ middlewares.js
        |_ policies.js
  |_ resources
  |_ policies
```

## rabbit adapter

The rabbit adapter uses `amqplib version 0.5.x`, and the adapter is built on top of its promise supported api,
the adapter library contains only two apis.

### publish

The publish api sends a message to the exchange and routes to the correct queue using the route key.

```javascript
/* the publish api jsdoc */

/**
 * Publishes a message to the exchange with a routing key
 * @param {string} route
 * @param {object} message
 */
async publish(route, message)
```

### subscribe

The subscribe api creates a dedicated queue binded to the exchange with a route key and listens on it,
if there are messages routed on the queue it will consume it and creates an _exclusive queue_ for the return value.

```javascript
/* the subscribe api jsdoc */

/**
 * Creates a listener on a queue with a route key
 * @param {string} route
 * @param {function} listener
 */
 async subscribe(route, listener)
```

## redis adapter

The redis adapter uses `node redis version 2.6.x`, the adapter still uses the core api.

## couchbase adapter

The couchbase adapter uses `node couchbase version 2.3.x`, the adapter wraps the basic endpoints with async methods,
the api is the same with the original apis but without the callback parameter.

```javascript
/**
 * Insert data to couchbase with its respective key
 * @param {string} key
 * @param {object} data
 * @param {object} options
 * @returns {Promise}
 */
async insert(key, data, options = {})

/**
 * Updates data to couchbase with its respective key
 * @param {string} key
 * @param {object} data
 * @param {object} options
 * @returns {Promise}
 */
async upsert(key, data, options = {})


/**
 * Get the json data given its respective id
 * @param {string} key
 * @param {object} options
 * @returns {Promise}
 */
async get(key, options = {})

/**
 * Run a query in the bucket using n1ql
 * @param {string} query
 * @param {object} params
 * @returns {Promise}
 */
async query(query, params = [])

/**
 * Deletes a document in the bucket
 * @param {string} key
 * @param {object} options
 * @returns {Promise}
 */
async remove(key, options = {})
```

## sendgrid adapter

The sendgrid adapter uses `node sendgrid version 4.7.x` and exposes a single api on top of sendgrid's promise api.

```javascript
/**
* Sends an email using sendgrid
* @param {String} object.from
* @param {String} object.subject
* @param {String} object.to
* @param {String} object.content
*/
async send({ from, subject, to, content })
```

## global.Adapter

The `global.Adapter` object contains all the loaded adapter classes, the ones which are enabled. In order to use an adapter you can call it this way, `global.Adapter.Sendgrid.send(...)` for the the sendgrid adapter or `Adapter.Couchbase.query(...)` and
then add `Adapter` on the `globals` definition on top of the file, `/* globals Adapter */`.

## global.Service

The `global.Service` object contains the microservice class, it has two methods `start()` and `stop()` respectively, you can
see it used at on the microservice's index.js.

## global.Module

The `global.Module` object contains the adapter's wrapper objects which has two methods `start()` and `stop()`, you can use this
object to _stop_ and _start_ an adapter, __but this is not recommended__ , the framework uses it on starting adapters and on graceful shutdown of adapters.
