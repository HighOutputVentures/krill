export default {
  type: 'object',
  properties: {
    links: {
      type: 'object',
      properties: {
        related: {
          type: 'object',
          properties: {
            href: { type: 'string' },
            meta: { type: 'object' },
          },
        },
        self: { type: 'string' },
      },
    },
    data: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        id: { type: ['string', 'integer'] },
        attributes: { type: 'object' },
        links: {
          type: 'object',
          properties: {
            self: { type: 'string' },
          },
        },
      },
      required: ['type', 'attributes'],
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          links: { type: 'object' },
          status: { type: 'string' },
          code: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' },
          source: {
            type: 'object',
            properties: {
              pointer: { type: 'string' },
              parameter: { type: 'string' },
            },
          },
          meta: { type: 'object' },
        },
      },
    },
    meta: { type: 'object' },
  },
};
