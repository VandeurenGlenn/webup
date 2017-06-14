'use strict';
import chalk from 'chalk';

/**
 * @param {string|object|array|number|boolean} input
 * @param {string} color
 */
const chalkify = (input, color = 'white') => {
  // check if input is object & stringify when true
  if (typeof input === 'object') {
    input = JSON.stringify(input);
  }
  return chalk[color](input);
}

export const log = (text, color = 'cyan') => {
  return console.log(chalkify(text, color));
}

export const warn = (text, color = 'yellow') => {
  return console.warn(chalkify(text, color));
}

export const debug = (text, color = 'yellow') => {
  if (global.debug) {
    return console.warn(chalkify(text, color));
  }
}
