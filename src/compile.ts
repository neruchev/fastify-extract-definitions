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
import { CachedSchemas, CompilerOptions, Method, Route, Routes } from './types';

export const transformResponse = (
  title: string,
  properties: Record<string, JSONSchema4>
): JSONSchema4[] =>
  Object.keys(properties).map((key) => {
    const item = properties[key];

    return {
      ...item,
      title: `${title}Status${item.title ? normalizeTitle(item.title) : key}`,
    };
  });

export const transformSchemaLevel = (
  title: string,
  schema: FastifySchema,
  list: CachedSchemas
): JSONSchema4 =>
  list.reduce<JSONSchema4>((acc, { name, capitalized }) => {
    const properties = (schema as any)[name];
    const newTitle = title + capitalized;

    if (!properties) {
      acc[capitalized] = {};
    } else if (name === 'response') {
      acc[capitalized] = {
        ...createSchemaObject(newTitle, undefined),
        oneOf: transformResponse(newTitle, properties),
      };
    } else {
      acc[capitalized] = { ...properties, title: newTitle };
    }

    return acc;
  }, {});

export const transformMethodLevel = (
  title: string,
  config: Route
): JSONSchema4 =>
  (Object.keys(config) as Method[]).reduce<JSONSchema4>((acc, method) => {
    const { uppercase, capitalized } = cachedMethods[method];

    const newTitle = title + capitalized;
    const schema = config[method]?.schema || {};

    const list = methodsWithBody.includes(method)
      ? cachedSchemasWithBody
      : cachedSchemas;

    const properties = transformSchemaLevel(newTitle, schema, list);

    acc[uppercase] = {
      ...createSchemaObject(newTitle, properties),
      description: (schema as any).description, // hack for fastify-swagger
    };

    return acc;
  }, {});

export const transformRootLevel = (
  routes: [route: string, config: Route][]
): JSONSchema4 =>
  routes.reduce<JSONSchema4>((acc, [route, config]) => {
    const title = generateEndpointName(route);
    const properties = transformMethodLevel(title, config);

    acc[route] = createSchemaObject(undefined, properties);

    return acc;
  }, {});

export const compile = async (
  routes: Routes,
  definitions: JSONSchema4,
  compilerOptions: CompilerOptions = {}
) => {
  const options = patchCompilerOptions(compilerOptions, definitions);
  const updatedRoutes = Array.from(routes).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0
  );

  const properties = transformRootLevel(updatedRoutes);
  const schema = createSchemaObject(rootName, properties);

  const text = await compileJson(schema, rootName, options);

  return text
    .replace(/\}\n\//g, '}\n\n/')
    .replace(/\}\nexport /g, '}\n\nexport ')
    .replace(/export type/g, '\nexport type');
};
