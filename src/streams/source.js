'use strict';
import globStream from 'glob-stream';

export default (options) => {
  return globStream(options.sources);
};
