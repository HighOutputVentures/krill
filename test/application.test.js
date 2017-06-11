import test from 'ava';
import _ from 'lodash';
import supertest from 'supertest';
import Arque from 'arque';
import { spawn } from 'child_process';

const request = supertest('http://localhost:8080');
const env = _.clone(process.env);
let app;

test.before(async() => {
  await new Promise((resolve) => {
    app = spawn('node', [`${__dirname}/application/dist/index`], { env });
    app.stdout.on('data', (data) => {
      data = data.toString();
      if (data.indexOf('server started') !== -1) { resolve(); }
    });
  });
});

test.after(async() => {
  app.kill('SIGTERM');
});

test('benchmark http endpoints', async(t) => {

  await Promise.all(_.times(200, async () => {
    await request[_.sample(['post', 'get', 'patch', 'delete'])]('/endpoint')
      .send({ data: {} });
  }));

  t.pass();
});

test('benchmark amqp endpoints', async(t) => {
  const arque = new Arque('amqp://guest:guest@localhost/');

  await Promise.all(_.times(500, async () => {
    const client =  await arque.createClient({ job: _.sample([
      'test.resource.create',
      'test.resource.retrieve',
      'test.resource.update',
      'test.resource.remove'
    ]), timeout: 10000 });
    const response = await client({ body: { message: 'hello' } });

    t.is(response.code, 'success');
  }));

  t.pass();
});
