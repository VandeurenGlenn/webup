'use strict';
import { Writable } from 'stream';
import writeFile from './../utils/write-file';
import { join, relative, resolve, dirname, normalize, posix, basename } from 'path';
import { warn } from './../utils/logger';
import globals from './../utils/globals';

class Destination extends Writable {
  constructor({dest = null, entry = null, cwd = process.cwd(), bundle = false}) {
    super({objectMode: true});
    this.destination = normalize(dirname(dest));
    this.cwd = cwd;
    this.on('finish', () => {
      this.emit('finished', bundle ? globals('bundle') : null);
    });

    this.root = resolve(dirname(entry));
  }

  write(chunck) {
    async function gen(self) {
      try {
        // try to create the destination
        let dir = join(self.destination, chunck.path);
        // when destination doen't include the destination dir try joining it.
        if (!dir.includes(self.destination)) {
          dir = join(self.destination, dir);
        }
        const writen = await writeFile(dir, chunck.contents);
        return Promise.resolve();
      } catch (error) {
        return warn(error);
      }
    }
    return gen(this);
  }
}

export default options => new Destination(options);
