'use strict';
// Using Transform instead of Readable so we don't need _read implemented
import { Transform } from 'stream';
import { dirname, join } from 'path';
import del from 'del';
import writeFile from './../utils/write-file';
import { serialize } from 'parse5';
import File from 'vinyl';
import bundler from './../utils/bundler';

// create rollup plugin (split css, js etc & ) exclude imports (when duplicate) & replace them with script tags(outside current script tag (in the html)) or some sort of loader (depending on config)
class Bundler extends Transform {
  constructor(options) {
    super({objectMode: true});
    const entrys = this.createEntrys(options);
    bundler(entrys, options).then(documents => {
      // iterate trough documents & push them into stream
      for (const id of documents.keys()) {
        this.push(new File({
          path: id,
          contents: new Buffer(serialize(documents.get(id).ast))
        }));
      }
      this.emit('end');
    });
  }

  createEntrys({entry, shell, fragments}) {
    return [entry, shell, ...fragments];
  }

}
export default options => new Bundler(options);
