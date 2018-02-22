module.exports = [
  {api: 'post /endpoint', resource: 'HTTPResource.post', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'get /endpoint', resource: 'HTTPResource.get', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'patch /endpoint', resource: 'HTTPResource.patch', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'delete /endpoint', resource: 'HTTPResource.delete', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
];
