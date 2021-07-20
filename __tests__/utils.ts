/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONSchema4 } from 'json-schema';

import {
  createSchemaObject,
  generateEndpointName,
  normalizeTitle,
  patchCompilerOptions,
} from '../src/utils';
import { CompilerOptions } from '../src/types';

const properties: Record<string, JSONSchema4> = {
  id: { type: 'string' },
  label: { type: 'string' },
};

const options: CompilerOptions = {
  format: true,
  bannerComment: 'test',
  strictIndexSignatures: true,
};

const optionsWithRef: CompilerOptions = {
  ...options,
  $refOptions: {
    parse: { json: true },
    resolve: { external: true },
  },
};

describe('Normalize title', () => {
  test('If the title is empty, an empty string will be returned', () => {
    expect(normalizeTitle('')).toBe('');
  });

  test('If the title is number, normalization working correctly', () => {
    expect(normalizeTitle('200')).toBe('200');
  });

  test('If the title contains specific symbols, normalization working correctly', () => {
    expect(normalizeTitle('foo/bar*&baz')).toBe('FooBarBaz');
  });

  test('Normalization working correctly', () => {
    expect(normalizeTitle('foo bar')).toBe('FooBar');
  });
});

describe('Generate endpoint name', () => {
  test('Empty endpoint returned "Empty"', () => {
    expect(generateEndpointName('')).toBe('Empty');
  });

  test('Root endpoint returned "Root"', () => {
    expect(generateEndpointName('/')).toBe('Root');
  });

  test('Starred endpoint returned "All"', () => {
    expect(generateEndpointName('/*')).toBe('All');
  });

  test('Endpoint with get params returned serialized get params', () => {
    expect(generateEndpointName('/?field1=test&field2=123')).toBe(
      'Field1TestField2123'
    );
  });

  test('Endpoint with regular expression returned serialized regular expression', () => {
    expect(generateEndpointName('/example/:foo/:bar([0-9-]+)/baz')).toBe(
      'ExampleFooBar09Baz'
    );
  });

  test('Endpoint with capitalized letters working correctly', () => {
    expect(generateEndpointName('/exAmple/Foo/bar/baz')).toBe(
      'ExAmpleFooBarBaz'
    );
  });

  test('Endpoint with hyphen working correctly', () => {
    expect(generateEndpointName('/ex-ample')).toBe('ExAmple');
  });

  test('Endpoint with one letter working correctly', () => {
    expect(generateEndpointName('/e')).toBe('E');
  });

  test('Duplicate endpoints are automatically numbered', () => {
    expect(generateEndpointName('/duplicated')).toBe('Duplicated');
    expect(generateEndpointName('/duplicated')).toBe('Duplicated1');
    expect(generateEndpointName('/duplicated')).toBe('Duplicated2');
  });
});

describe('Create schema object', () => {
  test('Creator with empty arguments returned simple object', () => {
    expect(createSchemaObject(undefined, undefined)).toEqual({
      type: 'object',
      additionalProperties: false,
    });
  });

  test('Creator with one title returned simple object with title', () => {
    expect(createSchemaObject('Test', undefined)).toEqual({
      type: 'object',
      title: 'Test',
      additionalProperties: false,
    });
  });

  test('Creator with full arguments returned normal object', () => {
    expect(createSchemaObject('Test', properties)).toEqual({
      type: 'object',
      title: 'Test',
      required: ['id', 'label'],
      properties,
      additionalProperties: false,
    });
  });
});

describe('Patch compiler options', () => {
  test('Patch empty options working correctly', () => {
    expect(patchCompilerOptions({}, properties)).toEqual({
      $refOptions: {
        resolve: {
          file: { read: expect.any(Function) },
        },
      },
      bannerComment: '',
      format: false,
    });
  });

  test('Patch root options working correctly', () => {
    expect(patchCompilerOptions(options, properties)).toEqual({
      $refOptions: {
        resolve: {
          file: { read: expect.any(Function) },
        },
      },
      bannerComment: '',
      format: false,
      strictIndexSignatures: true,
    });
  });

  test('Patch ref options working correctly', () => {
    expect(patchCompilerOptions(optionsWithRef, properties)).toEqual({
      $refOptions: {
        parse: { json: true },
        resolve: {
          file: { read: expect.any(Function) },
          external: true,
        },
      },
      bannerComment: '',
      format: false,
      strictIndexSignatures: true,
    });
  });

  test('Resolver working correctly', () => {
    const patchedConfig = patchCompilerOptions(
      optionsWithRef,
      properties
    ) as any;
    const resolver = patchedConfig.$refOptions.resolve.file.read;

    expect(resolver({ url: process.cwd() + '/label' })).toEqual(
      properties.label
    );
  });

  test('Resolver with undefined definitions returned error', () => {
    const patchedConfig = patchCompilerOptions(optionsWithRef, {}) as any;
    const resolver = patchedConfig.$refOptions.resolve.file.read;

    expect(() => resolver({ url: process.cwd() + '/label' })).toThrowError(
      `fastify-extract-definitions: cannot resolve schema for ${process.cwd()}/label`
    );
  });
});
