'use strict';
import { Transform } from 'stream';
import { load } from './../utils/plugins-runner';
import { readFile } from 'mz/fs';
import { extname } from 'path';

class Load extends Transform {
  constructor({plugins}) {
    super({objectMode: true});
    this.plugins = plugins;
  }

  _transform(file, encoding, callback) {
    async function gen(self) {
      try {
        if (Boolean(extname(file.path))) {
          file.contents = await readFile(file.path);
          file = await load(file, self.plugins);
          callback(null, file)
        } else {
          callback(null, null)
        }
      } catch (error) {
        throw error;
      }
    }
    return gen(this);
  }
}
export default options => new Load(options);
