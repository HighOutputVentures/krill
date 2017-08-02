export default [
  { type: 'http', service: 'sample', api: 'post /endpoint', resource: 'HTTPResource.post', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'http', service: 'sample', api: 'get /endpoint', resource: 'HTTPResource.get', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'http', service: 'sample', api: 'patch /endpoint', resource: 'HTTPResource.patch', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'http', service: 'sample', api: 'delete /endpoint', resource: 'HTTPResource.delete', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },

  { type: 'amqp', api: 'test.resource.create', resource: 'AMQPResource.create', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'amqp', api: 'test.resource.retrieve', resource: 'AMQPResource.retrieve', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'amqp', api: 'test.resource.update', resource: 'AMQPResource.update', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
  { type: 'amqp', api: 'test.resource.remove', resource: 'AMQPResource.remove', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5'], schema: { body: 'resource' } },
];
