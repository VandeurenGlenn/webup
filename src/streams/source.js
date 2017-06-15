'use strict';
import { Readable } from 'stream';
import { warn } from './../utils/logger';
import read from 'vinyl-read';
import { extname } from 'path';
import { load } from './../utils/plugins-runner';

class Source extends Readable {
  constructor({sources, shell, fragments, plugins}) {
    super({objectMode: true});
    this.sources = [...sources, ...fragments];
    this.plugins = plugins;
    this.set = {};
    return this.loadFile();
  }

  loadFile() {
    async function gen(self) {
      try {
        const files = await read(self.sources);
        self.set = files;
        // self.push(files);
        for (let file of files) {
          if (Boolean(extname(file.path))) {
            file = await load(file, self.plugins);
            self.push(file);
          }
        }
        self.emit('end')
      } catch (error) {
        throw error;
      }
    }
    gen(this);
  }

  _read(chunck, encoding, callback) {
  }
}

export default path => new Source(path);
