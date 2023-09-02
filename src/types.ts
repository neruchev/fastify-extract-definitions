import { RouteOptions } from 'fastify';
import { Options } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import { FastifyRoutes } from '@fastify/routes';

export type Result = string;

export type Route = RouteOptions[];
export type Routes = FastifyRoutes;

export type CachedSchemas = Array<{ name: string; capitalized: string }>;
export type CompilerOptions = Partial<Options>;
export type ExtractorOptions = {
  enabled?: boolean;
  ignoreHead?: boolean;
  outputs: {
    [filePath: string]: {
      target: 'serverTypes' | 'clientTypes';
    };
  };
  compilerOptions?: CompilerOptions;
  onSchemaReady?: (schema: JSONSchema4) => Promise<void>;
};
