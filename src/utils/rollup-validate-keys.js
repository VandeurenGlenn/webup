'use strict';
const ALLOWED_KEYS = [
	'acorn',
	'banner',
	'cache',
	'context',
	'dest',
	'entry',
	'exports',
	'external',
	'footer',
	'format',
	'globals',
	'indent',
	'interop',
	'intro',
	'legacy',
	'moduleContext',
	'moduleId',
	'moduleName',
	'noConflict',
	'onwarn',
	'outro',
	'paths',
	'plugins',
	'preferConst',
	'sourceMap',
	'sourceMapFile',
	'targets',
	'treeshake',
	'useStrict'
];

/**
 * removes invalid keys for running rollup.
 */
export default options => {
  for (const key of Object.keys(options)) {
    if (ALLOWED_KEYS.indexOf(key) < 0) {
      delete options[key];
    }
  }
  return options;
}
