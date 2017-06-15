'use strict';
import { normalize } from 'path';

const run = (file, plugins, fn) => {
  async function gen() {
    for (const plugin of plugins) {
      // TODO: add error handler for when path or contents aren't defined.
      if (plugin[fn]) {
        const { path, contents } = await plugin[fn](file);
        file.contents = contents;
      }
    }
    file.path = normalize(file.path);
    return Promise.resolve(file);
  }
  return gen();
}

export const load = (file, plugins) => {
  return run(file, plugins, 'load');
}

export const loadImport = (file, plugins) => {
  return run(file, plugins, 'loadImport');
}
