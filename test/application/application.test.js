const test = require('ava');
const _ = require('lodash');
const supertest = require('supertest');
const Arque = require('arque');
const Krill = require('../..');
const {load} = require('../../utilities');
const bootloaders = require('./config/bootloaders');
const middlewares = require('./config/middlewares');
const routes = require('./config/routes');

process.chdir(__dirname);

const request = supertest('http://localhost:8080');
const krill = new Krill({
  bootloaders,
  middlewares,
  routes,
  resources: load('resources'),
  policies: load('policies')
});

test.before(async () => {
  await krill.start();
});

test.after(async () => {
  await krill.stop();
});

test('benchmark http endpoints', async t => {
  await Promise.all(_.times(200, async () => {
    await request[_.sample(['post', 'get', 'patch', 'delete'])]('/endpoint')
      .send({data: {}});
  }));

  t.pass();
});

test('benchmark amqp endpoints', async t => {
  const arque = new Arque('amqp://guest:guest@localhost/');

  await Promise.all(_.times(500, async () => {
    const client = await arque.createClient({
      job: _.sample([
        'test.resource.create',
        'test.resource.retrieve',
        'test.resource.update',
        'test.resource.remove'
      ]),
      timeout: 10000
    });
    const response = await client({body: {message: 'hello'}});

    t.is(response.code, 'success');
  }));

  t.pass();
});
