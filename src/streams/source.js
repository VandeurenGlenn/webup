'use strict';
import globStream from 'glob-stream';

export default ({sources}) => {
  return globStream(sources);
};
