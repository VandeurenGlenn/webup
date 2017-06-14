'use strict';
import { resolve, extname } from 'path';
import build from './build';
import bundle from './bundle';
import ensureArray from './utils/ensure-array';
import { extend, clone } from 'underscore';

const defaultOptions = {
  entry: null,
  dest: null,
  sourceMap: true,
  cwd: process.cwd(),
  plugins: [],
  include: null,
  fragments: [],
  presets: ['default'],
  exclude: ['reload/**/*.js'] // exclude common libs
}

const requirePlugins = options => {
  try {
    const set = [];
    const plugins = ensureArray(options.plugins).map(plugin => {
      const name = `webup-plugin-${plugin}`;
      plugin = require(name)(options);
      if (Array.isArray(plugin)) {
        for (const task of plugin) {
          if (typeof task === 'object') {
            set.push(task);
          } else {
            return Promise.reject(`${name} should only export an array or object`);
          }
        }
      } else {
        if (typeof plugin === 'object') {
          set.push(plugin);
        } else {
          return Promise.reject(`${name} should only export an array or object`);
        }
      };
    });
    return Promise.resolve(set);
  } catch (error) {
    return Promise.reject(error)
  }
}

const requirePresets = options => {
  try {
    const set = [];
    const presets = ensureArray(options.presets).map(preset => {
      const name = `webup-preset-${preset}`;
      preset = require(name)(options);
      if (Array.isArray(preset)) {
        for (const task of preset) {
          if (typeof task === 'object') {
            set.push(task);
          } else {
            return Promise.reject(`${name} should only export an array or object`);
          }
        }
      } else {
        if (typeof preset === 'object') {
          set.push(preset);
        } else {
          return Promise.reject(`${name} should only export an array or object`);
        }
      };
    });
    return Promise.resolve(set);
  } catch (error) {
    return Promise.reject(error)
  }
}

const validateOptions = options => {
  const expected = ['entry', 'dest', 'sourceMap', 'presets', 'sources'];
  for (const option of expected) {
    if (options.type === 'html' && option === 'sources') {
      if (!Boolean(options[option])) {
        return Promise.reject(`expects sources when building html, be sure you added them in your config`);
      }
    } else if (!Boolean(options[option]) && options.type !== 'html' && option !== 'sources') {
      return Promise.reject(`${option} is undefined`);
    }
  }

  return Promise.resolve(options);
}
/**
 * @module webup
 *
 * @param {string} options.entry entry of the build
 * @param {string} options.dest destination for the build
 * @param {boolean} options.bundle wether or not to bundle
 * @param {boolean} options.sourceMap wether or not to include sourceMaps
 * @param {string} options.cwd the current working directory
 */
export default options => {
  return new Promise((indicate, reject) => {
    options = extend(defaultOptions, options);
    async function gen() {
      try {
        if (options.entry.includes('.html')) {
          options.type = 'dom';
        } else if (options.entry.includes('.js')) {
          options.type = 'module';
        } else {
          return reject(`${extname(options.entry)} is not supported`);
        }
        options = await validateOptions(options);
        const presets = await requirePresets(options);
        const promises = [];
        for (const preset of presets) {
          // clone options so we don't overwrite it & extend clone with preset.
          const config = extend(clone(options), preset);
          // ensure fragments is an array
          const fragments = ensureArray(config.fragments);
          // get the plugins
          const plugins = await requirePlugins(config);
          // extend config with preset plugins & fragments
          await build(extend(config, {plugins: plugins, fragments: fragments}));

          await bundle(extend(config, {plugins: plugins, fragments: fragments}));
        }
        indicate();
      } catch (error) {
        return reject(error);
      }
      // return Promise.resolve('');
    }

    gen(options);
  });
}