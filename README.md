# fastify-extract-definitions

[![NPM version](https://img.shields.io/npm/v/fastify-extract-definitions.svg?style=flat)](https://www.npmjs.com/package/fastify-extract-definitions)
![Tests](https://github.com/neruchev/fastify-extract-definitions/workflows/Tests/badge.svg)

Automatically extracts TypeScript definitions from [Fastify](https://www.npmjs.com/package/fastify) router schema and generates server and client typings. Based on [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) package.

For `fastify@>=4.2` use `fastify-extract-definitions@1.3.0`.

For `fastify@3` use `fastify-extract-definitions@0.0.4`.

## Pre requirements

- `node.js`: `>=10.*`
- `fastify`: `>=3.*`

## Installation

Install it with yarn:

```sh
yarn add fastify-extract-definitions
```

Or with npm:

```sh
npm install fastify-extract-definitions
```

## Usage

Add it to your project with register, pass it some options, and you are done!

⚠️ Note! Use this plugin for development only, make sure it is disabled in production.

```ts
import Fastify from 'fastify';
import extractor from 'fastify-extract-definitions';

const fastify = Fastify();

fastify.register(extractor, {
  enabled: process.env.NODE_ENV === 'development',
  outputs: {
    './types.d.ts': {
      target: 'serverTypes',
    },
  },
});
```

See [example](./example) for more details.

## Options

| key             | type                                     | default                                                                                                          | description                                                                                          |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| enabled         | `boolean`                                | `false`                                                                                                          | Is the plugin enabled?                                                                               |
| ignoreHead      | `boolean`                                | `false`                                                                                                          | Ignore HEAD endpoints                                                                                |
| outputs         | `object`                                 | `{}`                                                                                                             | Outputs config                                                                                       |
| compilerOptions | `object`                                 | See [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript#options) default options | [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript#options) options |
| onSchemaReady   | `(schema: JSONSchema4) => Promise<void>` | -                                                                                                                | Set the handler to custom handle json schema                                                         |

### Outputs config

```ts
[outputPath: string]: {
  target: 'serverTypes' | 'clientTypes';
};
```

## License

MIT
