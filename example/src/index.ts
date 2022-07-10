import Fastify from 'fastify';
import extractor from 'fastify-extract-definitions';

import { version } from 'package.json';

import * as root from 'src/handlers/root';
import * as foo from 'src/handlers/foo';
import { NODE_ENV } from 'src/constants';
import { RootGet, FooBarGet } from 'src/types';

const fastify = Fastify();

fastify.addSchema({
  $id: 'enums',
  title: 'Enums',
  type: 'object',
  properties: {
    mode: {
      title: 'MODE',
      type: 'string',
      enum: ['production', 'development', 'test'],
      example: 'development',
    },
  },
  required: ['mode'],
  additionalProperties: false,
});

fastify.register(extractor, {
  enabled: NODE_ENV === 'development',
  ignoreHead: true,
  outputs: {
    './src/types.ts': {
      target: 'serverTypes',
    },
  },
});

fastify.register(async (fastify) => {
  fastify.get<RootGet>('/', root.options, root.handler);
  fastify.get<FooBarGet>('/foo/:bar', foo.options, foo.handler);
});

fastify.listen({ port: 8000, host: 'localhost' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`🚀 Server ${version} ready at: ${address}`);
});
