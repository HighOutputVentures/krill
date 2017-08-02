# krilljs [![CircleCI](https://circleci.com/gh/HighOutputVentures/krill.svg?style=svg)](https://circleci.com/gh/HighOutputVentures/krill)

krilljs is your simple microservice scaffold.

## Getting Started

```javascript
import Krill from 'krilljs';
import { load } from 'krilljs/utilities';
import bootloaders from './config/bootloaders';
import middlewares from './config/middlewares';
import routes from './config/routes';

/* constructor */
const krill = new Krill({
  bootloaders,
  middlewares,
  routes,
  resources: load('resources'),
  policies: load('policies'),
});

/* function chain */
const krill = new Krill()
  .bootloaders(bootloaders)
  .middlewares(middlewares)
  .routes(routes)
  .resources(load('resources'))
  .policies(load('policies'));

/* to start krill using the default config */
krill.start();

/* you can specify specific config values */
krill.start({
  koa: {
    host: '127.0.0.1',
    port: '8080'
  },
  rabbitmq: {
    host: '127.0.0.1',
    vhost: '/'
    port: '5672',
    username: 'guest',
    password: 'guest'
  }
});
```

The `config` folder contains the service's configuration and is more explained in the next section, the configurations are declaratively structured for convenience.

The `policies` folder contains all route polices, policies are executed after the middlewares whenever an endpoint is called.

The `resources` folder contains all the __endpoint resources__, a __resource__ is a function which is used to manage data models, composes multiple requests, reroute protocols (i.e. from http to amqp), in other words this is were the logic happens.

### Simple Configuration Structure

```sh
config
  |_ bootloaders.js
  |_ middlewares.js
  |_ policies.js
  |_ routes.js
```

The `bootloaders.js` is a list of functions that are called first when a microservice starts.

```javascript
/* bootloaders.js */

export default [
  function load() {
    /* load adapters */
    global.adapters = require('./adapters').default;
  },
  function customLoader() { /* put your bootloader here */ },
  /* you can add more bootloaders also */
];
```

The `middlewares.js` is a list of function that are called sequentially when an endpoint is called. Middlewares are good for generic endpoint logic such as logging, api analytics, checking api rate limit etc.

```javascript
/* middlewares.js */

export default {

  http: [
    function async logger(ctx, next) {
      try {
        const { headers, body } = ctx.request;
        debug({ headers, body });

        await next();
      } catch (err) { debug(err); }
    },
    function async customMiddleware() { /* put your custom middleware here */ },
    /* you can also add more middlewares */
  ],

  amqp: [
    function async logger(ctx, next) {
      try {
        const { headers, body } = ctx.request;
        debug({ headers, body });

        await next();
      } catch (err) { debug(err); }
    },
    function async customMiddleware() { /* put your custom middleware here */ },
    /* you can also add more middlewares */
  ],

};
```

The `routes.js` contains the endpoint definition (endpoint type, attached resource function, api path and policies).

Policies should only contain rules that controls request checks to the api or specific apis, policies are called just before the endpoint function itself.

```javascript
/* routes.js */

export default [
  { type: 'http', api: 'post /v1/auth', policies: ['policy1', 'policy2'], resource: 'OAuthResource.auth' },
  { type: 'http', api: 'delete /v1/auth', policies: [], resource: 'OAuthResource.revoke' },
  /* you can add more route definitions here */
];
```

## Route Types

There are two route types `amqp` and `http`. Amqp routes uses [arque](https://github.com/HighOutputVentures/arque) for doing the rpc message pattern.
Http routes uses [koa](https://github.com/koajs/koa) and follows the middleware-policy-resource pattern.

## Tools

Tools are created for specific features, all these tools are on experimental status, they can be deprecated anytime if it does not provide any significance.

### Mailer

```javascript
import mailer from 'krilljs/tools/mailer';

mailer(
  [
    { from: ..., to: ..., subject: ..., text: ... },
    { from: ..., to: ..., subject: ..., text: ... },
    { from: ..., to: ..., subject: ..., text: ... },
    { from: ..., to: ..., subject: ..., text: ... },
    ...
  ],
  5, /* prefetch */
  100, /* delay */
  function(err) { if (err) throw err; }
);
```

The mailer tool sends bulk emails using mailgun in a controlled manner using the prefetch and delay configurations, prefetch is the number of emails send concurrently in a single time while the delay is the interval in seconds between prefetches.

### Analytics

```javascript
import analytics from 'krilljs/tools/analatics';

analytics()
  .identity([
    { identity: 'sample1@local.host', properties: { ... } },
    { identity: 'sample2@local.host', properties: { ... } },
    { identity: 'sample3@local.host', properties: { ... } },
    { identity: 'sample4@local.host', properties: { ... } },
    ...
  ]);

analytics()
  .track([
    {
      identity: 'sample@local.host',
      timestamp: new Date().toISOString(),
      event: 'test_event',
      properties: { ... }
    },
    {
      identity: 'sample@local.host',
      timestamp: new Date().toISOString(),
      event: 'test_event',
      properties: { ... }
    },
    {
      identity: 'sample@local.host',
      timestamp: new Date().toISOString(),
      event: 'test_event',
      properties: { ... }
    },
    ...
  ]);

```

The analytics api can register an identity, in our case a user, that the tracked will be mapped later using the `identity()` method. To track the events you can use the `track()` api. Both methods accept arrays of objects defined in the example above.

### RabbitMQ

```javascript
import rabbitmq from 'krilljs/tools/rabbitmq';

rabbitmq('service.resource.method', { ... }, 3000)
  .then((reponse) => { ... });
```

This tool is the rabbitmq client, you can call amqp endoints that are define on other microservices using this tool.