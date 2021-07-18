/* tslint:disable */
/**
 * This file was automatically generated by fastify-extract-definitions.
 * DO NOT MODIFY IT BY HAND. Instead, modify the fastify routes schemas
 * and re-run project to regenerate this file.
 */

import {
  ContextConfigDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteHandlerMethod,
} from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';

export type Handler<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault
> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGeneric,
  ContextConfig
>;

export type RootGetReply = RootGetReplyStatus200;

export type MODE = 'production' | 'development' | 'test';

export type FooBarGetReply = FooBarGetReplyStatus200;

export type FooBarGetReplyStatus200 = string;

export interface API {
  '/': {
    GET: RootGet;
  };
  '/foo/:bar': {
    GET: FooBarGet;
  };
}

export interface RootGet {
  Querystring: unknown;
  Params: unknown;
  Headers: unknown;
  Reply: RootGetReply;
}

export interface RootGetReplyStatus200 {
  version: string;
  name: string;
  mode: MODE;
}

export interface FooBarGet {
  Querystring: unknown;
  Params: FooBarGetParams;
  Headers: unknown;
  Reply: FooBarGetReply;
}

export interface FooBarGetParams {
  bar: string;
}
