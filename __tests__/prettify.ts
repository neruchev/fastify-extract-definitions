import { Options } from 'prettier';

import { prettify } from '../src/prettify';

const cwd = process.cwd();

jest.mock('prettier', () => ({
  format: async (text: string, config: Options) => config,
  resolveConfig: async (path: string) =>
    path === cwd ? { resolvedConfig: true } : null,
}));

describe('Prettify output', () => {
  test("Formatting doesn't work if it disabled", async () => {
    const formatter = await prettify({ format: false });
    const result = await formatter('not formatted');

    expect(result).toBe('not formatted');
  });

  test('The formatter uses the repository config if the config from the parameters is empty', async () => {
    const formatter = await prettify();
    const result = await formatter('not formatted');

    expect(result).toEqual({ parser: 'typescript', resolvedConfig: true });
  });

  test('The formatter uses the default config if the config from the parameters is empty and there is no repository config', async () => {
    const spy = jest.spyOn(process, 'cwd');
    spy.mockReturnValue('mocked value');

    const formatter = await prettify();
    const result = await formatter('not formatted');

    expect(result).toEqual({
      parser: 'typescript',
      bracketSpacing: false,
      printWidth: 120,
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: 'none',
      useTabs: false,
    });
  });
});
