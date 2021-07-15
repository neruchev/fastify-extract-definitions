import { resolve } from 'path';
import { promises } from 'fs';

export const save = async (text: string, path: string) => {
  const filePath = resolve(path);

  try {
    const data = await promises.readFile(filePath);

    if (data.toString() === text) {
      return;
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}

  await promises.writeFile(filePath, text);
};
