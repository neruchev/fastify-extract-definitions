import { RouteOptions } from 'fastify';
import { Options } from 'json-schema-to-typescript';

export type Method =
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put';

export type Result = string;

export type Route = { [method in Method]?: RouteOptions };
export type Routes = Map<string, Route>;

export type CachedSchemas = Array<{ name: string; capitalized: string }>;
export type CompilerOptions = Partial<Options>;
export type ExtractorOptions = {
  enabled: boolean;
  outputs: {
    [filePath: string]: {
      target: 'serverTypes' | 'clientTypes';
    };
  };
  compilerOptions?: CompilerOptions;
};
