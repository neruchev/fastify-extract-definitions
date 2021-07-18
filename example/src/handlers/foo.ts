import { RouteShorthandOptions } from 'fastify';

import { Handler, FooBarGet } from 'src/types';

export const options: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      required: ['bar'],
      properties: {
        bar: { type: 'string' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

export const handler: Handler<FooBarGet> = (request, reply) => {
  reply.send(request.params.bar);
};
