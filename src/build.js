'use strict';
import pipe from 'multipipe';
import del from 'del';
import { dirname, join as joinPath } from 'path';
import { clone } from 'underscore';
import source from './streams/source';
import load from './streams/load';
import split from './streams/split';
import resolveImports from './streams/resolve-imports';
import plugins from './streams/plugins';
import join from './streams/join';
import bundler from './streams/bundler';
import bundle from './utils/bundle';
import dest from './streams/dest';


const build = options => {
  return new Promise((resolve, reject) => {
    async function gen() {
      try {
        // const cleaned = await del(dirname(options.dest));

        pipe(
          source(options),
          load(options),
          resolveImports(options),
          split(options),
          plugins(options),
          join(options),
          bundler(options)
        ).pipe(dest(options).on('finished', map => {
          if (map) resolve(bundle(map, options));
          else resolve();
        }));
      } catch (error) {
        return reject(error);
      }
    }
    gen();
  });
}
export default build;
