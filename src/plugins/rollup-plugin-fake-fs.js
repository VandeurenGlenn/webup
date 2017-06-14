'use strict';
import { join, dirname, resolve, normalize, posix } from 'path'
import chalk from 'chalk';
import resolveId from './../resolve-id';
import {warn} from './../utils/logger';

const fs = require('mz/fs');
const {readFile} = fs;

/**
 * @param {string} path source to file
 * @param {buffer|string} contents the file content
 */
export default (files, cwd) => {
  let entry = '';
  let baseDir = '';
  const set = {}
  let previousId = '';
  return {
    name: 'fake-fs',
    options(options) {
      entry = posix.normalize(options.entry);
      return options;
    },
    resolveId(id) {
      if (!id.includes('.js')) {
        id += '.js';
      }
      if (entry === id) {
        baseDir = dirname(id);
      }
      return posix.normalize(id).replace(/\\/g, '/');
    },
    load(id) {
      return new Promise((resolve, reject) => {
        let contents;
        async function gen() {
          if(!set[id] && files[id]) {
            set[id] = true;
            return resolve(files[id].toString());
          } else if(!files[id]) {
            try {
              contents = await readFile(id, 'utf-8');
            } catch (error) {
              id = resolveId(dirname(id), dirname(previousId), cwd);
              warn(error);
              if (error.code === 'ENOENT') {
                try {
                  contents = await readFile(id, 'utf-8');
                } catch (error) {
                  files[id] = null;
                  return warn(error);
                }
              }
            }
            return resolve(contents);
          }

          if (!contents) {
            resolve(null)
          }

          previousId = id;
        }
        gen();
      });
    }
  }
};
