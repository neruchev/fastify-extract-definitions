import { format, resolveConfig, Options } from 'prettier';

import { CompilerOptions, Result } from './types';

export const defaultPrettierOptions: Options = {
  bracketSpacing: false,
  printWidth: 120,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
};

export const prettify = async (compilerOptions: CompilerOptions = {}) => {
  if (compilerOptions.format === false) {
    return async (result: Result) => result;
  }

  let prettierOptions: Options | null = compilerOptions.style || null;

  if (!prettierOptions) {
    prettierOptions = await resolveConfig(process.cwd());
  }

  if (!prettierOptions) {
    prettierOptions = defaultPrettierOptions;
  }

  return async (result: Result) =>
    format(result, { parser: 'typescript', ...prettierOptions });
};
