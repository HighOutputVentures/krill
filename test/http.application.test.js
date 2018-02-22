const test = require('ava');
const _ = require('lodash');
const supertest = require('supertest');
const Arque = require('arque');
const { Krill } = require('../..');
const {load} = require('../../utilities');
const bootloaders = require('./fixtures/http/config/bootloaders');
const middlewares = require('./fixtures/http/config/middlewares');
const routes = require('./config/routes');

process.chdir(__dirname);

const request = supertest('http://localhost:8080');
const krill = new Krill({
  bootloaders,
  middlewares,
  routes,
  resources: load('fixtures/http/resources'),
  policies: load('fixtures/http/policies')
});

test.before(async () => { await krill.start(); });

test.after(async () => { await krill.stop(); });

test('http endpoints', async t => {
  await Promise.all(_.times(200, async () => {
    await request[_.sample(['post', 'get', 'patch', 'delete'])]('/endpoint')
      .send({data: {}});
  }));

  t.pass();
});

