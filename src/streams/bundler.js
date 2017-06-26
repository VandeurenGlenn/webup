'use strict';
// Using Transform instead of Readable so we don't need _read implemented
import { Transform } from 'stream';
import { dirname, join } from 'path';
import del from 'del';
import writeFile from './../utils/write-file';
import File from 'vinyl';
import bundler from './../utils/bundler';
import globals from './../utils/globals';

// create rollup plugin (split css, js etc & ) exclude imports (when duplicate) & replace them with script tags(outside current script tag (in the html)) or some sort of loader (depending on config)
class Bundler extends Transform {
  constructor({ bundle }) {
    super({objectMode: true});
    this.shouldBundle = bundle;
  }

  _transform(file, encoding, callback) {
    if (this.shouldBundle) {
      this.bundle = globals('bundleMap') || new Map();
      this.bundle.set(file.path, file.contents);
      globals('bundleMap', this.bundle);
      callback(null, null);
    } else {
      callback(null, file);
    }
  }

  /**
   * @return {array} containing entry & fragments
   */
  createEntrys({entry, fragments}) {
    if (!entry || !fragments) {
      this.emit('error',
        new Error(entry ? 'fragments undefined' : 'entry undefined')
      );
      return;
    }
    return [entry, ...fragments];
  }

}
export default options => new Bundler(options);
