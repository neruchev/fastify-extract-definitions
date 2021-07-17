# fastify-extract-definitions

Automatically extracts TypeScript definitions from [Fastify](https://www.npmjs.com/package/fastify) router schema and generates server and client typings. Based on [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) package.

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

> Note! Use this plugin for development only, make sure it is disabled in production.

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

See [examples](./examples) for more details.

## Options

| key             | type    | default                                                                                                          | description                                                                                          |
| --------------- | ------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| enabled         | boolean | `false`                                                                                                          | Is the plugin enabled?                                                                               |
| outputs         | object  | `{}`                                                                                                             | Outputs config                                                                                       |
| compilerOptions | object  | See [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript#options) default options | [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript#options) options |

### Outputs config

```ts
[outputPath: string]: {
  target: 'serverTypes' | 'clientTypes';
};
```

## License

MIT
