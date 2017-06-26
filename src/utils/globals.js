'use strict';
global.__globals__ = global.__globals__ || {};
const namespace = (namespace = null) => {
  if (namespace) {
    global.__globals__.namespace = namespace;
    global[namespace] = global[namespace] || {};
  }
  return global.__globals__.namespace || '__globals__';
};
/**
* @module globals
* @param {string} get the name of the property to return its value
* @param {string|boolean|object|array|number} set a value to set.
* @param {string} namespace the name you call when searching your cat.
*/
export default (get, set = '@globals__set__') => {
  if (typeof get === 'object') {
    return namespace(get.namespace);
  }
  const name = namespace();
  if (set === '@globals__set__') {
    try {
      const value = global[name][get];
      return value;
    } catch (error) {
      return undefined;
    }
  } else return global[name][get] = set;
}
