/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifySchema } from 'fastify';
import { JSONSchema4 } from 'json-schema';
import { compile as compileJson } from 'json-schema-to-typescript';

import {
  cachedMethods,
  cachedSchemas,
  cachedSchemasWithBody,
  methodsWithBody,
  rootName,
} from './constants';
import {
  createSchemaObject,
  generateEndpointName,
  normalizeTitle,
  patchCompilerOptions,
} from './utils';
import { CachedSchemas, CompilerOptions, Route, Routes } from './types';

export const transformResponse = (
  title: string,
  properties: Record<string, JSONSchema4>
): JSONSchema4[] =>
  Object.keys(properties).map((key) => {
    const item = properties[key];

    if (item['$ref']) {
      return item;
    }

    return {
      ...item,
      title: `${title}Status${item.title ? normalizeTitle(item.title) : key}`,
    };
  });

export const transformSchemaLevel = (
  title: string,
  schema: FastifySchema,
  list: CachedSchemas
): JSONSchema4 | undefined => {
  const result = list.reduce<JSONSchema4>((acc, { name, capitalized }) => {
    const properties = (schema as any)[name];
    const newTitle = properties?.title || title + capitalized;

    if (properties) {
      acc[capitalized] =
        name === 'response'
          ? {
              ...createSchemaObject(newTitle, undefined),
              oneOf: transformResponse(newTitle, properties),
            }
          : { ...properties, title: newTitle };
    }

    return acc;
  }, {});

  return Object.keys(result).length ? result : undefined;
};

export const transformMethodLevel = (
  title: string,
  config: Route,
  ignoreHead: boolean
): JSONSchema4 =>
  config.reduce<JSONSchema4>((acc, record) => {
    const methods =
      typeof record.method === 'string' ? [record.method] : record.method;

    methods.forEach((method) => {
      if (!ignoreHead || method !== 'HEAD') {
        const { capitalized } = cachedMethods[method];

        const newTitle = title + capitalized;
        const schema = record.schema || {};

        const list = methodsWithBody.includes(method)
          ? cachedSchemasWithBody
          : cachedSchemas;

        const properties = transformSchemaLevel(newTitle, schema, list);

        acc[method] = {
          ...createSchemaObject(newTitle, properties),
          description: (schema as any).description, // hack for @fastify/swagger
        };
      }
    });

    return acc;
  }, {});

export const transformRootLevel = (
  routes: [route: string, config: Route][],
  ignoreHead: boolean
): JSONSchema4 =>
  routes.reduce<JSONSchema4>((acc, [route, config]) => {
    const title = generateEndpointName(route);
    const properties = transformMethodLevel(title, config, ignoreHead);

    acc[route] = createSchemaObject(undefined, properties);

    return acc;
  }, {});

export const compile = async (
  routes: Routes,
  definitions: JSONSchema4,
  ignoreHead: boolean,
  compilerOptions: CompilerOptions = {}
) => {
  const options = patchCompilerOptions(compilerOptions, definitions);
  const updatedRoutes = Array.from(routes).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0
  );

  const properties = transformRootLevel(updatedRoutes, ignoreHead);
  const schema = { ...createSchemaObject(rootName, properties), definitions };

  const text = await compileJson(schema, rootName, options);

  return text
    .replace(/\}\n\//g, '}\n\n/')
    .replace(/\}\nexport /g, '}\n\nexport ')
    .replace(/export type/g, '\nexport type');
};
