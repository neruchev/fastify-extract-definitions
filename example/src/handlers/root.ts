import { RouteShorthandOptions } from 'fastify';

import { name, version } from 'package.json';

import { NODE_ENV } from 'src/constants';
import { Handler, RootGet } from 'src/types';

export const options: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        required: ['version', 'name', 'mode'],
        properties: {
          version: { type: 'string' },
          name: { type: 'string' },
          mode: { $ref: 'enums#/properties/mode' },
        },
        additionalProperties: false,
      },
    },
  },
};

export const handler: Handler<RootGet> = (request, reply) => {
  reply.send({ name, version, mode: NODE_ENV });
};
