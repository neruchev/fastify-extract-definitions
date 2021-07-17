import { RouteOptions, HTTPMethods } from 'fastify';
import { JSONSchema4 } from 'json-schema';

import {
  transformMethodLevel,
  transformResponse,
  transformRootLevel,
  transformSchemaLevel,
} from '../src/compile';
import { createSchemaObject } from '../src/utils';
import { cachedSchemasWithBody } from '../src/constants';
import { Route, Handlers } from '../src/types';

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

const schema = (route: string): Route => ({
  delete: config(route, 'DELETE'),
  get: config(route, 'GET'),
  head: config(route, 'HEAD'),
  options: config(route, 'OPTIONS'),
  patch: config(route, 'PATCH'),
  post: config(route, 'POST'),
  put: config(route, 'PUT'),
});

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

    expect(schema).toEqual({
      Body: {},
      Querystring: {},
      Params: {},
      Headers: {},
      Reply: {},
    });
  });

  test('All field titles except the Response will be ignored', () => {
    const schema = transformSchemaLevel(
      'MyTitle',
      {
        body: createSchemaObject('Custom title 1', {}),
        querystring: createSchemaObject('Custom title 2', {}),
        params: createSchemaObject('Custom title 3', {}),
        headers: createSchemaObject('Custom title 4', {}),
        response: {
          200: createSchemaObject('Custom title 5', {}),
        },
      },
      cachedSchemasWithBody
    );

    expect(schema).toEqual({
      Body: createSchemaObject('MyTitleBody', {}),
      Headers: createSchemaObject('MyTitleHeaders', {}),
      Params: createSchemaObject('MyTitleParams', {}),
      Querystring: createSchemaObject('MyTitleQuerystring', {}),
      Reply: {
        ...createSchemaObject('MyTitleReply', undefined),
        oneOf: [createSchemaObject('MyTitleReplyStatusCustomTitle5', {})],
      },
    });
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
      Body: {},
      Querystring: {},
      Params: {},
      Headers: {},
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
      Body: createSchemaObject('MyTitleBody', properties),
      Headers: createSchemaObject('MyTitleHeaders', properties),
      Params: createSchemaObject('MyTitleParams', properties),
      Querystring: createSchemaObject('MyTitleQuerystring', properties),
      Reply: {},
    });
  });
});

describe('Transform method level', () => {
  test('If the config is empty, an empty object will be returned', () => {
    expect(transformMethodLevel('MyTitle', {}, [])).toEqual({});
  });

  test('Body for all requests except POST, PUT and PATCH will be ignored', () => {
    const result = transformMethodLevel('MyTitle', schema(''), []);

    expect(result.DELETE.properties.Body).toBeUndefined();
    expect(result.GET.properties.Body).toBeUndefined();
    expect(result.HEAD.properties.Body).toBeUndefined();
    expect(result.OPTIONS.properties.Body).toBeUndefined();

    expect(result.PATCH.properties.Body).toBeDefined();
    expect(result.POST.properties.Body).toBeDefined();
    expect(result.PUT.properties.Body).toBeDefined();
  });

  test('Transformer working correctly', () => {
    expect(transformMethodLevel('MyTitle', schema(''), [])).toEqual({
      DELETE: createSchemaObject('APIMyTitleDelete', {
        Querystring: createSchemaObject('APIMyTitleDeleteQuerystring', {}),
        Params: createSchemaObject('APIMyTitleDeleteParams', {}),
        Headers: createSchemaObject('APIMyTitleDeleteHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitleDeleteReply', undefined),
          oneOf: [createSchemaObject('APIMyTitleDeleteReplyStatus200', {})],
        },
      }),
      GET: createSchemaObject('APIMyTitleGet', {
        Querystring: createSchemaObject('APIMyTitleGetQuerystring', {}),
        Params: createSchemaObject('APIMyTitleGetParams', {}),
        Headers: createSchemaObject('APIMyTitleGetHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitleGetReply', undefined),
          oneOf: [createSchemaObject('APIMyTitleGetReplyStatus200', {})],
        },
      }),
      HEAD: createSchemaObject('APIMyTitleHead', {
        Querystring: createSchemaObject('APIMyTitleHeadQuerystring', {}),
        Params: createSchemaObject('APIMyTitleHeadParams', {}),
        Headers: createSchemaObject('APIMyTitleHeadHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitleHeadReply', undefined),
          oneOf: [createSchemaObject('APIMyTitleHeadReplyStatus200', {})],
        },
      }),
      OPTIONS: createSchemaObject('APIMyTitleOptions', {
        Querystring: createSchemaObject('APIMyTitleOptionsQuerystring', {}),
        Params: createSchemaObject('APIMyTitleOptionsParams', {}),
        Headers: createSchemaObject('APIMyTitleOptionsHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitleOptionsReply', undefined),
          oneOf: [createSchemaObject('APIMyTitleOptionsReplyStatus200', {})],
        },
      }),
      PATCH: createSchemaObject('APIMyTitlePatch', {
        Body: createSchemaObject('APIMyTitlePatchBody', {}),
        Querystring: createSchemaObject('APIMyTitlePatchQuerystring', {}),
        Params: createSchemaObject('APIMyTitlePatchParams', {}),
        Headers: createSchemaObject('APIMyTitlePatchHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitlePatchReply', undefined),
          oneOf: [createSchemaObject('APIMyTitlePatchReplyStatus200', {})],
        },
      }),
      POST: createSchemaObject('APIMyTitlePost', {
        Body: createSchemaObject('APIMyTitlePostBody', {}),
        Querystring: createSchemaObject('APIMyTitlePostQuerystring', {}),
        Params: createSchemaObject('APIMyTitlePostParams', {}),
        Headers: createSchemaObject('APIMyTitlePostHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitlePostReply', undefined),
          oneOf: [createSchemaObject('APIMyTitlePostReplyStatus200', {})],
        },
      }),
      PUT: createSchemaObject('APIMyTitlePut', {
        Body: createSchemaObject('APIMyTitlePutBody', {}),
        Querystring: createSchemaObject('APIMyTitlePutQuerystring', {}),
        Params: createSchemaObject('APIMyTitlePutParams', {}),
        Headers: createSchemaObject('APIMyTitlePutHeaders', {}),
        Reply: {
          ...createSchemaObject('APIMyTitlePutReply', undefined),
          oneOf: [createSchemaObject('APIMyTitlePutReplyStatus200', {})],
        },
      }),
    });
  });

  test('Handler definitions are generated successfully', () => {
    const handlersDefinitions: Handlers = [];

    transformMethodLevel('MyTitle', schema(''), handlersDefinitions);
    expect(handlersDefinitions).toMatchSnapshot();
  });
});

describe('Transform root level', () => {
  const handlersDefinitions: Handlers = [];
  const routes: [route: string, config: Route][] = [
    ['/foo', schema('/foo')],
    ['/bar', schema('/bar')],
  ];

  const result = transformRootLevel(routes, handlersDefinitions);

  test('Transformer works correctly', () => {
    expect(result).toMatchSnapshot();
  });

  test('Handler definitions are generated successfully', () => {
    expect(handlersDefinitions).toMatchSnapshot();
  });
});
