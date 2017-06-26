'use strict';
import globStream from 'glob-stream';
import { join } from 'path';

/**
 * @return {array} containing entry & fragments
 */
const createEntrys = ({entry, fragments, shell, cwd = process.cwd()}) => {
  if (!entry || !fragments) {
      return new Error(entry ? 'fragments undefined' : 'entry undefined')
    return;
  }
  return [entry, shell, ...fragments];
}

export default (options) => {
  return globStream(options.sources);
};
