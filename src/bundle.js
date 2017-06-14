'use strict';
import multipipe from 'multipipe';
import plugins from './streams/plugins';
import bundler from './streams/bundler';
import clean from './streams/clean';
import dest from './streams/dest';

export default options => {
  return new Promise((resolve, reject) => {
    async function gen() {
      const { bundle } = options;
      if (bundle) {
        try {
          multipipe(
            bundler(options),
            clean(options.dest),
            plugins(options),
            dest(options).on('finish', () => {
              return resolve();
            }));
        } catch (error) {
          return reject(error);
        }
      } else {
        return resolve();
      }
    }
    gen();
  });
};
