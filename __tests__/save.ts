import { promises } from 'fs';

import { save } from '../src/save';

let i = 0;
let file = '';

jest.mock('fs', () => ({
  promises: {
    writeFile: async (path: string, text: string) => {
      i = i + 1;
      file = text + i;
    },
    readFile: async () => {
      if (file) {
        return file;
      }

      throw new Error('error');
    },
  },
}));

describe('Save file', () => {
  test('If a file not found file will be written', async () => {
    await save('foo', 'foo/bar');
    const text = await promises.readFile('foo/bar');

    expect(text).toBe('foo1');
  });

  test('If the texts are equivalent, the file will not be written', async () => {
    await save('foo1', 'foo/bar');
    const text = await promises.readFile('foo/bar');

    expect(text).toBe('foo1');
  });

  test('If the texts are not equivalent, the file will be written', async () => {
    await save('bar', 'foo/bar');
    const text = await promises.readFile('foo/bar');

    expect(text).toBe('bar2');
  });
});
