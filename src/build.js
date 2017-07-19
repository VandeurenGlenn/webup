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
import { fork } from 'child_process';
import {chalkify } from './utils/logger.js'
let count = 0;

const promiseBuild = options => {
  return new Promise((resolve, reject) => {
    pipe(
      source(options),
      load(options),
      resolveImports(options),
      split(options),
      plugins(options),
      join(options),
      bundler(options)
    ).pipe(dest(options).on('finished', map => {
      resolve(map);
    }));
  });
}

const build = options => {
  const logWorker = fork(joinPath(__dirname, 'workers/log-worker.js'));
  logWorker.send('start');
  logWorker.send(chalkify('building', 'cyan'));
  const id = options.name || 'preset-' + count++;
  return new Promise((resolve, reject) => {
    async function gen() {
      try {
        // const cleaned = await del(dirname(options.dest));
        const map = await promiseBuild(options);
        if (map) {
          const done = await bundle(map, options);
        }
        logWorker.on('message', () => {
          logWorker.kill('SIGINT');
          resolve();
        });
        logWorker.send(chalkify(`${id}::build finished`, 'cyan'));
        logWorker.send('done');
      } catch (error) {
        logWorker.kill('SIGINT');
        return reject(error);
      }
    }
    gen();
  });
}
export default build;
