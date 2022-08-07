import { RouteOptions, HTTPMethods } from 'fastify';
import { JSONSchema4 } from 'json-schema';

import {
  compile,
  transformMethodLevel,
  transformResponse,
  transformRootLevel,
  transformSchemaLevel,
} from '../src/compile';
import { createSchemaObject } from '../src/utils';
import { cachedSchemasWithBody } from '../src/constants';
import { Route } from '../src/types';

const properties: Record<string, JSONSchema4> = {
  id: { type: 'string' },
  label: { type: 'string' },
};

const config = (route: string, method: HTTPMethods): RouteOptions => ({
  method,
  url: `${route}/${method}`,
  handler: console.log,
  schema: {
    body: createSchemaObject(undefined, {}),
    querystring: createSchemaObject(undefined, {}),
    params: createSchemaObject(undefined, {}),
    headers: createSchemaObject(undefined, {}),
    response: {
      200: createSchemaObject(undefined, {}),
    },
  },
});

const schema = (route: string): Route => [
  config(route, 'DELETE'),
  config(route, 'GET'),
  config(route, 'HEAD'),
  config(route, 'OPTIONS'),
  config(route, 'PATCH'),
  config(route, 'POST'),
  config(route, 'PUT'),
];

describe('Transform response', () => {
  test('Response without title transformed correctly', () => {
    const response = {
      200: createSchemaObject(undefined, properties),
    };

    expect(transformResponse('Test', response)).toEqual([
      createSchemaObject('TestStatus200', properties),
    ]);
  });

  test('Response with title transformed correctly', () => {
    const response = {
      200: createSchemaObject('Custom title', properties),
    };

    expect(transformResponse('Test', response)).toEqual([
      createSchemaObject('TestStatusCustomTitle', properties),
    ]);
  });

  test('Response without properties transformed correctly', () => {
    const response = {
      200: createSchemaObject(undefined, {}),
    };

    expect(transformResponse('Test', response)).toEqual([
      createSchemaObject('TestStatus200', {}),
    ]);
  });
});

describe('Transform schema level', () => {
  test('If no schema is specified, an empty object will be returned', () => {
    const schema = transformSchemaLevel(
      'CustomTitle',
      {},
      cachedSchemasWithBody
    );

    expect(schema).toEqual({});
  });

  test('Response transformed correctly', () => {
    const schema = transformSchemaLevel(
      'CustomTitle',
      {
        response: {
          200: createSchemaObject(undefined, properties),
          500: createSchemaObject('Custom error', {}),
        },
      },
      cachedSchemasWithBody
    );

    expect(schema).toEqual({
      Reply: {
        ...createSchemaObject('CustomTitleReply', undefined),
        oneOf: [
          createSchemaObject('CustomTitleReplyStatus200', properties),
          createSchemaObject('CustomTitleReplyStatusCustomError', {}),
        ],
      },
    });
  });

  test('Other fields transform correctly', () => {
    const schema = transformSchemaLevel(
      'MyTitle',
      {
        body: createSchemaObject('Custom title 1', properties),
        querystring: createSchemaObject('Custom title 2', properties),
        params: createSchemaObject('Custom title 3', properties),
        headers: createSchemaObject('Custom title 4', properties),
      },
      cachedSchemasWithBody
    );

    expect(schema).toEqual({
      Body: createSchemaObject('Custom title 1', properties),
      Headers: createSchemaObject('Custom title 4', properties),
      Params: createSchemaObject('Custom title 3', properties),
      Querystring: createSchemaObject('Custom title 2', properties),
    });
  });
});

describe('Transform method level', () => {
  test('If the config is empty, an empty object will be returned', () => {
    expect(transformMethodLevel('MyTitle', [], false)).toEqual({});
  });

  test('Body for all requests except POST, PUT and PATCH will be ignored', () => {
    const result = transformMethodLevel('MyTitle', schema(''), false);

    expect(result.DELETE.properties.Body).toBeUndefined();
    expect(result.GET.properties.Body).toBeUndefined();
    expect(result.HEAD.properties.Body).toBeUndefined();
    expect(result.OPTIONS.properties.Body).toBeUndefined();

    expect(result.PATCH.properties.Body).toBeDefined();
    expect(result.POST.properties.Body).toBeDefined();
    expect(result.PUT.properties.Body).toBeDefined();
  });

  const output = {
    DELETE: createSchemaObject('MyTitleDelete', {
      Querystring: createSchemaObject('MyTitleDeleteQuerystring', {}),
      Params: createSchemaObject('MyTitleDeleteParams', {}),
      Headers: createSchemaObject('MyTitleDeleteHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitleDeleteReply', undefined),
        oneOf: [createSchemaObject('MyTitleDeleteReplyStatus200', {})],
      },
    }),
    GET: createSchemaObject('MyTitleGet', {
      Querystring: createSchemaObject('MyTitleGetQuerystring', {}),
      Params: createSchemaObject('MyTitleGetParams', {}),
      Headers: createSchemaObject('MyTitleGetHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitleGetReply', undefined),
        oneOf: [createSchemaObject('MyTitleGetReplyStatus200', {})],
      },
    }),
    OPTIONS: createSchemaObject('MyTitleOptions', {
      Querystring: createSchemaObject('MyTitleOptionsQuerystring', {}),
      Params: createSchemaObject('MyTitleOptionsParams', {}),
      Headers: createSchemaObject('MyTitleOptionsHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitleOptionsReply', undefined),
        oneOf: [createSchemaObject('MyTitleOptionsReplyStatus200', {})],
      },
    }),
    PATCH: createSchemaObject('MyTitlePatch', {
      Body: createSchemaObject('MyTitlePatchBody', {}),
      Querystring: createSchemaObject('MyTitlePatchQuerystring', {}),
      Params: createSchemaObject('MyTitlePatchParams', {}),
      Headers: createSchemaObject('MyTitlePatchHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitlePatchReply', undefined),
        oneOf: [createSchemaObject('MyTitlePatchReplyStatus200', {})],
      },
    }),
    POST: createSchemaObject('MyTitlePost', {
      Body: createSchemaObject('MyTitlePostBody', {}),
      Querystring: createSchemaObject('MyTitlePostQuerystring', {}),
      Params: createSchemaObject('MyTitlePostParams', {}),
      Headers: createSchemaObject('MyTitlePostHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitlePostReply', undefined),
        oneOf: [createSchemaObject('MyTitlePostReplyStatus200', {})],
      },
    }),
    PUT: createSchemaObject('MyTitlePut', {
      Body: createSchemaObject('MyTitlePutBody', {}),
      Querystring: createSchemaObject('MyTitlePutQuerystring', {}),
      Params: createSchemaObject('MyTitlePutParams', {}),
      Headers: createSchemaObject('MyTitlePutHeaders', {}),
      Reply: {
        ...createSchemaObject('MyTitlePutReply', undefined),
        oneOf: [createSchemaObject('MyTitlePutReplyStatus200', {})],
      },
    }),
  };

  test('Transformer with HEAD ignoring working correctly', () => {
    expect(transformMethodLevel('MyTitle', schema(''), true)).toEqual(output);
  });

  test('Transformer without HEAD ignoring working correctly', () => {
    expect(transformMethodLevel('MyTitle', schema(''), false)).toEqual({
      ...output,
      HEAD: createSchemaObject('MyTitleHead', {
        Querystring: createSchemaObject('MyTitleHeadQuerystring', {}),
        Params: createSchemaObject('MyTitleHeadParams', {}),
        Headers: createSchemaObject('MyTitleHeadHeaders', {}),
        Reply: {
          ...createSchemaObject('MyTitleHeadReply', undefined),
          oneOf: [createSchemaObject('MyTitleHeadReplyStatus200', {})],
        },
      }),
    });
  });
});

describe('Transform root level', () => {
  test('Transformer works correctly', () => {
    const routes: [route: string, config: Route][] = [
      ['/foo', schema('/foo')],
      ['/bar', schema('/bar')],
    ];
    const result = transformRootLevel(routes, false);

    expect(result).toMatchSnapshot();
  });
});

describe('Compile', () => {
  const definitions = {
    enums: {
      $id: 'enums',
      type: 'object',
      title: 'enums',
      required: ['mode'],
      properties: {
        mode: {
          title: 'Mode',
          type: 'string',
          enum: ['production', 'staging', 'development', 'test'],
        },
      },
      additionalProperties: false,
    },
  };

  describe('Handle refs', () => {
    const routes = new Map<string, Route>();

    routes.set('/', [
      {
        url: '/',
        method: 'GET',
        handler: console.log,
        schema: {
          params: { $ref: 'enums#/properties/mode' },
          response: {
            200: { $ref: 'enums#/properties/mode' },
          },
        },
      },
    ]);

    test('Compiler working correctly', async () => {
      const result = await compile(routes, definitions, false);

      expect(result).toMatchSnapshot();
    });

    test('Compiler with `unreachableDefinitions` option working correctly', async () => {
      const result = await compile(routes, definitions, false, {
        unreachableDefinitions: true,
      });

      expect(result).toMatchSnapshot();
    });
  });

  describe('Handle duplicates', () => {
    const routes = new Map<string, Route>();

    routes.set('/a', [
      {
        url: '/a',
        method: 'GET',
        handler: console.log,
        schema: {
          params: { $ref: 'enums#/properties/mode' },
        },
      },
    ]);

    routes.set('/b', [
      {
        url: '/b',
        method: 'GET',
        handler: console.log,
        schema: {
          params: { title: 'Mode', type: 'number' },
        },
      },
    ]);

    routes.set('/c', [
      {
        url: '/c',
        method: 'GET',
        handler: console.log,
        schema: {
          params: { title: 'Mode', type: 'string' },
        },
      },
    ]);

    routes.set('/d', [
      {
        url: '/d',
        method: 'GET',
        handler: console.log,
        schema: {
          params: { title: 'Mode', type: 'string' },
        },
      },
    ]);

    test('Compiler working correctly', async () => {
      const result = await compile(routes, definitions, false);

      expect(result).toMatchSnapshot();
    });

    test('Compiler with `unreachableDefinitions` option working correctly', async () => {
      const result = await compile(routes, definitions, false, {
        unreachableDefinitions: true,
      });

      expect(result).toMatchSnapshot();
    });
  });
});
