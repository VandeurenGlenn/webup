'use strict';
import { Transform } from 'stream';
import { join, dirname } from 'path';
import {rollup} from 'rollup';
const { extend } =  require('underscore');
import { createFilter } from 'rollup-pluginutils';

class Filter extends Transform {
  /**
   * @param {array} include included imports
   * @param {array} exclude excluded imports
   * @param {boolean} strict wether or not pass objects without a path property
   */
  constructor({include, exclude, strict = false}) {
    // set objectMode to true for reading & writing
    super({objectMode: true});

    this.filter = createFilter(include, exclude)
  }

  _transform(input, encoding, callback) {
    if (typeof input === 'object') {
      if (input.path) {
        callback(null, this.filter(input.path) ? input : null);
      } else if (!this.strict) {
        callback(null, input);
      }
    } else {
      callback('typeof input::object expected', input);
    }
  }
}

export default options => {return new Filter(options)};
