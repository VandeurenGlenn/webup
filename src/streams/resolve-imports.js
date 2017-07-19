'use strict';
import { Transform } from 'stream';
import { resolve, dirname, join, normalize, relative } from 'path';
import {createFilter} from 'rollup-pluginutils';
import { loadImport } from './../utils/plugins-runner';
import vinylFile from 'vinyl';
import globals from './../utils/globals';
import fs from 'mz/fs';
const { readFile } = fs;

class ResolveImports extends Transform {
  constructor({plugins, include, exclude, cwd, sources, id, entry}) {
    // set objectMode to true for reading & writing
    super({objectMode: true});
    this.cwd = cwd;
    this.plugins = plugins;
    this.duplicates = {};
    this.set = {};
    this.sources = sources;
    this.filter = createFilter(include, exclude);
    this.defaults();
    this.sharedImports = new Map();
    this.root = dirname(entry);
  }

  defaults() {
    this.imports = new Map();
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
        // add host to set
        self.set[file.path] = file.contents;
        // push host so we contain order.
        self.push(file);
      } else {
        self.duplicates[file.path] = true;
      }

      // read imports
      const imports = await self.handleImports(dirname(file.path), self.getImports(file.contents.toString()));

      // TODO: create & implement dependency bundler
      // const sharedImports = new Map();
      //
      // for (const i of self.imports) {
      //   const id = i[0];
      //   const value = i[1];
      //   const resolvedPath = resolve(dirname(file.path), id);
      //
      //   const counts = self.sharedImports.get(resolvedPath);
      //   if (counts > 1) {
      //     // add to the host its sharedImports so we can iterate trough them
      //     // when the project is more mature ...
      //     // in the meantime using polymer-bundler & polymer-analyzer to achieve this
      //     sharedImports.set(id, resolvedPath);
      //   }
      // }
      // get bundle
      const bundle = globals('bundle') || new Map();
      // set bundle
      bundle.set(relative(self.root, file.path), {
        code: file.contents,
        imports: self.imports
        // commented untill dependency bundler is implemented
        // sharedImports: sharedImports
      });

      // save bundle
      globals('bundle', bundle);

      // reset imports & sharedImports
      self.defaults();

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
          let id = importee.src || importee.href;
          self.imports.set(id, importee);
          // resolve path
          if (id.includes('../')) {
            id = resolve(root, id);
          } else if (!id.includes(root)) {
            // iterate trough the sources to check if dependency of dependencies
            // TODO: iterate trough entrys .... (shell, entry, fragments) whenever sources isn't used
            let isNotHost = true;
            for (const source of self.sources) {
              if (source === id) {
                isNotHost = false;
              }
            }
            if (isNotHost) {
              id = join(root, id);
            }
          }
          // TODO: create importsMap ...
          if (self.filter(id) && !id.includes('.html_.')) {
            if (self.set[id] && !self.duplicates[id]) {
              if (self.sharedImports.get(id)) {
                self.sharedImports.set(id, (self.sharedImports.get(id) + 1));
              } else {
                self.sharedImports.set(id, 1);
              }
              // return resolve();
            } else if (!self.set[id]) {
              try {
                // when id is included load & push it
                const contents = await readFile(id);
                let file = new vinylFile({path: id, contents: contents});
                // run load
                file = await loadImport(file, self.plugins);
                self.set[id] = file.contents;
                self.push(file);
                const done = await self.handleImports(dirname(id), self.getImports(file.contents.toString()));
              } catch (e) {
                console.warn(e);
              }
            }
          }
        }
      }
      return Promise.resolve();
    }
    return gen(this);
  }

  handleImport(importee) {
    importee = String(importee);
    const object = {};
    if (this.isValid(importee)) {
      object.isValid = true;
      object.code = importee;
      if (this.isJs(importee)) {
        importee = importee.match('src="(.*)"')[0]
                           .replace('src="', '').replace('.js"', '.js');
        object.nodeName = 'script';
        object.src = importee;
      } else if (this.isLink(importee)) {
        importee = importee.match('href="(.*)"')[0]
                           .replace('href="', '').replace('"', '');
        object.nodeName = 'link';
        object.href = importee;
      }
      return new Object(object);
    }
    return console.warn(`invalid import::${importee}`);
  }

  isValid(importee) {
    if (importee.includes('<link') || importee.includes('<script')) {
      return true;
    }
    return false;
  }

  isLink(importee) {
    // check if rel property is valid
    if (importee.includes('<link') &&
        importee.includes('rel="')) return true;
    return false;
  }

  isJs(importee) {
    if (importee.includes('<script') && importee.includes('src="')) return true;
    return false;
  }
}

export default options => {return new ResolveImports(options)};
