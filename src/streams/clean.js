import { Transform } from 'stream';
import del from 'del';
import { dirname, join, resolve } from 'path';

class Clean extends Transform {
  constructor(cwd) {
    super({objectMode: true});
    this.cwd = dirname(cwd);
  }

  _transform(file, encoding, callback) {
    const id = join(this.cwd, resolve(this.cwd, file.path));
    del(id).then(() => {
      callback(null, file);
    });
  }
}

export default root => new Clean(root);
