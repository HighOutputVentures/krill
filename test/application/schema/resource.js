module.exports = {
  type: 'object',
  properties: {
    links: {
      type: 'object',
      properties: {
        related: {
          type: 'object',
          properties: {
            href: {type: 'string'},
            meta: {type: 'object'}
          }
        },
        self: {type: 'string'}
      }
    },
    data: {type: 'object'},
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'string'},
          links: {type: 'object'},
          status: {type: 'string'},
          code: {type: 'string'},
          title: {type: 'string'},
          detail: {type: 'string'},
          source: {
            type: 'object',
            properties: {
              pointer: {type: 'string'},
              parameter: {type: 'string'}
            }
          },
          meta: {type: 'object'}
        }
      }
    },
    meta: {type: 'object'}
  }
};
