const test = require('ava');
const _ = require('lodash');
const supertest = require('supertest');
const Krill = require('../');
const {load} = require('../utilities');
const bootloaders = require('./fixture/http/config/bootloaders');
const middlewares = require('./fixture/http/config/middlewares');
const routes = require('./fixture/http/config/routes');

process.chdir(__dirname);

const request = supertest('http://localhost:8080');
const krill = new Krill({
  service: 'koa',
  bootloaders,
  middlewares,
  routes,
  resources: load('fixture/http/resources'),
  policies: load('fixture/http/policies'),
  env: {
    host: '127.0.0.1',
    port: '8080'
  }
});

test.before(async () => {
  await krill.start();
});

test.after(async () => {
  await krill.stop();
});

test('http endpoints', async t => {
  await Promise.all(_.times(200, async () => {
    await request[_.sample(['post', 'get', 'patch', 'delete'])]('/endpoint')
      .send({data: {}});
  }));

  t.pass();
});

