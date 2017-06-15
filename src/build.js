'use strict';
import multipipe from 'multipipe';
import del from 'del';
import { dirname, join as joinPath } from 'path';
import { clone } from 'underscore';
import source from './streams/source';
import load from './streams/load';
import split from './streams/split';
import resolveImports from './streams/resolve-imports';
import plugins from './streams/plugins';
import join from './streams/join';
import dest from './streams/dest';

const build = options => {
  return new Promise((resolve, reject) => {
    async function gen() {
      const { bundle } = options;
      if (bundle) {
        return resolve();
      }
      try {
        const cleaned = await del(dirname(options.dest));
        multipipe(
          source(options),
          load(options),
          resolveImports(options),
          split(),
          plugins(options),
          join(options),
          dest(options).on('finish', () => {
            resolve();
          }));
      } catch (error) {
        return reject(error);
      }
    }
    gen();
  });
}
export default build;
