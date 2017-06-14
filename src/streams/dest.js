'use strict';
import { Writable } from 'stream';
import writeFile from './../utils/write-file';
import { join, relative, resolve, dirname, normalize, posix, basename } from 'path';
import { warn } from './../utils/logger';
let i = 0
class Destination extends Writable {
  constructor({dest = null, cwd = process.cwd()}) {
    super({objectMode: true});
    this.path = normalize(dirname(dest));
    this.cwd = cwd;
  }

  write(chunck) {
    async function gen(self) {
      try {
        // try to create the destination
        let dir = join(self.path, relative(self.cwd, chunck.path));
        // when destination doen't include the destination dir try joining it.
        if (!dir.includes(self.path)) {
          dir = join(self.path, dir);
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
