import { resolve } from 'path';
import { existsSync, promises } from 'fs';

export const save = async (text: string, path: string) => {
  const filePath = resolve(path);

  if (existsSync(filePath)) {
    const data = await promises.readFile(filePath);

    if (data.toString() === text) {
      return;
    }
  }

  await promises.writeFile(filePath, text);
};
