'use strict';
import { Transform } from 'stream';
import { resolve, dirname, join } from 'path';
import {createFilter} from 'rollup-pluginutils';
import { loadImport } from './../utils/plugins-runner';
import vinylFile from 'vinyl';
import fs from 'mz/fs';
const { readFile } = fs;

class ResolveImports extends Transform {
  constructor({plugins, include, exclude, cwd}) {
    // set objectMode to true for reading & writing
    super({objectMode: true});
    this.cwd = cwd;
    this.plugins = plugins;
    this.duplicates = {};
    this.set = {};

    this.filter = createFilter(include, exclude);
  }

  getImports(doc) {
    // return links and scripts (for now)
    const links = doc.match(new RegExp('<link (.*)>', 'g')) || [];
    const scripts = doc.match(new RegExp('<script src="(.*).js"></script>', 'g')) || [];
    return [...links, ...scripts];
  }

  _transform(file, encoding, callback) {
    async function gen(self) {

      if (!self.set[file.path]) {
        self.set[file.path] = file.contents;
        // push host so we contain order.
        self.push(file);
      } else {
        self.duplicates[file.path] = true;
      }
      const imports = await self.handleImports(dirname(file.path), self.getImports(file.contents.toString()))
      // callback null so the host doesn't come after it's children.
      callback(null, null);
    }
    return gen(this);
  }

  handleImports(root, imports) {
    async function gen(self) {
      if (imports && imports.length > 0) {
        for (let importee of imports) {
          importee = await self.handleImport(importee);
          // resolve path
          if (importee.includes('../')) {
            importee = resolve(root, importee);
          } else {
            importee = join(root, importee);
          }
          // when importee is included load & push it
          if (self.filter(importee) && !self.set[importee] && !importee.includes('.html_.')) {
            const contents = await readFile(importee);
            let file = new vinylFile({path: importee, contents: contents});

            // run load
            file = await loadImport(file, self.plugins);
            self.set[importee] = file.contents;
            self.push(file);
            const done = await self.handleImports(dirname(importee), self.getImports(file.contents.toString()));
            // return reslve();
          } else {
            // return resolve();
          }
        }
      }
      return Promise.resolve();
    }
    return gen(this);
  }

  handleImport(importee) {
    importee = String(importee);
    if (this.isValid(importee)) {
      if (this.isJs(importee)) {
        importee = importee.match('src="(.*)"')[0].replace('src="', '').replace('.js"', '.js');
      } else if (this.isLink(importee)) {
        importee = importee.match('href="(.*)"')[0].replace('href="', '').replace('"', '');
      }
      return importee;
    }
    return console.warn(`invalid import::${importee}`);
  }

  isValid(importee) {
    if (importee.includes('link') || importee.includes('script')) {
      return true;
    }
    return false;
  }

  isLink(importee) {
    // check if rel property is valid
    if (importee.includes('rel="stylesheet"') ||
        importee.includes('rel="import"')) return true;
    return false;
  }

  isJs(importee) {
    if (importee.includes('src="')) return true;
    return false;
  }
}

export default options => {return new ResolveImports(options)};
