import { JSONSchema4 } from 'json-schema';

import { CompilerOptions } from './types';

const generated: Record<string, number> = {};

export const normalizeTitle = (title: string) =>
  title
    .replace(/[^0-9a-z ]/gi, ' ')
    .split(' ')
    .filter((item) => item !== '')
    .map((item) => item[0].toUpperCase() + item.slice(1))
    .join('');

export const generateEndpointName = (endpoint: string) => {
  if (!endpoint) {
    return 'Empty';
  }

  const parts = endpoint
    .replace('/*', '/all')
    .replace(/[^0-9a-z/?&=:]/gi, '')
    .split(/[/?&=:]+/)
    .filter((item) => item !== '')
    .map((item) => item[0].toUpperCase() + item.slice(1));

  if (!parts.length) {
    return 'Root';
  }

  const name = parts.join('');
  const counter = generated[name] || 0;

  generated[name] = counter + 1;
  return counter ? name + counter : name;
};

export const createSchemaObject = (
  title: string | undefined,
  properties: Record<string, JSONSchema4> | undefined
): JSONSchema4 => ({
  title,
  type: 'object',
  required: properties ? Object.keys(properties) : undefined,
  properties,
  additionalProperties: false,
});

export const patchCompilerOptions = (
  options: CompilerOptions,
  definitions: JSONSchema4
): CompilerOptions => {
  const cwd = options.cwd || process.cwd();

  return {
    ...options,
    bannerComment: '',
    format: false,
    $refOptions: {
      ...options.$refOptions,
      resolve: {
        file: {
          read: (file) => {
            const key = file.url.replace(cwd, '');
            const text = definitions[key] || definitions[key.slice(1)];

            if (!text) {
              const error = new Error(
                `fastify-extract-definitions: cannot resolve schema for ${file.url}`
              );

              throw error;
            }

            return text;
          },
        },
        ...options.$refOptions?.resolve,
      },
    },
  };
};
