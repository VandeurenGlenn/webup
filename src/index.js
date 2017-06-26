'use strict';
import { resolve, extname } from 'path';
import build from './build';
// import bundle from './bundle';
import ensureArray from './utils/ensure-array';
import { extend, clone } from 'underscore';
import sourceMapSupport from 'source-map-support';
import globals from './utils/globals';

// setup sourceMap support
sourceMapSupport.install();

const defaultOptions = {
  entry: null,
  dest: null,
  sourceMap: true,
  cwd: process.cwd(),
  plugins: [],
  include: null,
  fragments: [],
  sources: [],
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

const requirePreset = (preset, options, cb) => {
  if (Array.isArray(preset)) {
    for (const task of preset) {
      if (typeof task === 'object') {
        cb(null, task);
      } else {
        cb(Promise.reject(`${name} should only export an array or object`), null);
      }
    }
  } else if (typeof preset === 'object') {
    cb(null, preset);
  } else if (typeof preset === 'string') {
    const name = `webup-preset-${preset}`;
    preset = require(name)(options);
    requirePreset(preset, options, (error, item) => {
      cb(null, item);
    });
  } else {
    cb(Promise.reject(`${name} invalid type`), null);
  }
}

const requirePresets = options => {
  try {
    const set = [];
    const presets = ensureArray(options.presets).map(preset => {
      requirePreset(preset, options, (error, item) => {
        if (error) {
          return error;
        }
        set.push(item);
      });
    });
    return Promise.resolve(set);
  } catch (error) {
    return Promise.reject(error)
  }
}

const validateOptions = options => {
  const expected = ['entry', 'dest', 'sourceMap', 'presets'];
  for (const option of expected) {
    if (!options[option]) {
      return Promise.reject(new Error(`${option} is undefined`));
    }
  }
  return Promise.resolve(options);
}

// when building html expect sources do be defined.
const validateOptionsType = options => {
  if (options.type === 'dom') {
    // check if html module or app (an app is defined as in having a shell & fragments).
    if (!Boolean(options.fragments) && Boolean(options.shell) || !Boolean(options.shell) && Boolean(options.fragments)) {
      return Promise.reject(
        new Error(`options.${options.fragments ? 'shell' : 'fragments'} undefined, checkout docs to learn more.`)
      );
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
        options = await validateOptions(options);
        if (options.entry.includes('.html')) {
          options.type = 'dom';
        } else if (options.entry.includes('.js')) {
          options.type = 'module';
        } else {
          return reject(`${extname(options.entry)} is not supported`);
        }
        options = await validateOptionsType(options);
        const presets = await requirePresets(options);
        const promises = [];
        for (const preset of presets) {
          // clone options so we don't overwrite it & extend clone with preset.
          const config = extend(clone(options), preset);
          // ensure fragments is an array
          const fragments = ensureArray(config.fragments);
          // get the plugins
          const plugins = await requirePlugins(config);

          const id = Math.random().toString(36).slice(2);

          globals({namespace: id});

          // extend config with preset plugins & fragments
          await build(extend(config, {plugins: plugins, fragments: fragments, id: id}));

          // await bundle(extend(config, {plugins: plugins, fragments: fragments, id: id}));
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
