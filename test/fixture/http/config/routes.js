module.exports = [
  {api: 'post /endpoint', resource: 'http-resource.post', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'get /endpoint', resource: 'http-resource.get', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'patch /endpoint', resource: 'http-resource.patch', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
  {api: 'delete /endpoint', resource: 'http-resource.delete', policy: ['policy1', 'policy2', 'policy3', 'policy4', 'policy5']},
];
