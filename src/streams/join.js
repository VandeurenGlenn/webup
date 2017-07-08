'use strict';
import { Transform } from 'stream';
import { resolve, relative, dirname } from 'path';
import globals from './../utils/globals';
import vinylFile from 'vinyl';

class Join extends Transform {
  constructor({inlineJs = false, inlineCss = false, entry}) {
    super({objectMode: true});
    this.inlineJs = inlineJs;
    this.inlineCss = inlineCss;
    this.bundle = {};
    this.root = dirname(entry);
  }

  joinCss(string, files) {
    return new Promise((resolve, reject) => {
      // if (!files) return string;
      for (const file of files) {
        const { path, contents } = file;
        string = string.replace(
          `<link rel="stylesheet" href="${path}">`,
          `<style>${contents}</style>`
        );
      }
      resolve(string);
    });
  }

  joinJs(string, files) {
    return new Promise((resolve, reject) => {
      // if (!files) return string;
      for (const file of files) {
        const { path, contents } = file;
        string = string.replace(
          `<script src="${path}"></script>`,
          `<script>${contents}</script>`
        );
      }
      resolve(string);
    });
  }

  _transform({ path, contents }, encoding, callback) {
    async function gen(self) {
      // when splitted, css comes first, then js and then the host file itself.
      // Create a reference id by removing added extensions
      const id = resolve(self.root, path).replace('_.css', '').replace('_.js', '').replace('.html', '');
      const bundle = globals('bundle') || new Map();
      // ensure contents is a string
      contents = contents.toString();
      self.bundle[id] = self.bundle[id] || {css: [], js: []};
      if (path.includes('.css') && self.inlineCss) {
        // Store the file till parent comes trough.
        self.bundle[id].css.push({path: path, contents: contents});
        return callback(null, null);
      } else if (path.includes('.js') && self.inlineJs) {
        // Store the file till parent comes trough.
        self.bundle[id].js.push({path: path, contents: contents});
        return callback(null, null);
      } else if (path.includes('.html') && !path.includes('.html_')) {
        // inject style
        if (self.inlineCss) {
          contents = await self.joinCss(contents, self.bundle[id].css);
        }
        // inject scripts
        if (self.inlineJs) {
          contents = await self.joinJs(contents, self.bundle[id].js);
        }
        const file = new vinylFile({path: relative(self.root, path), contents: new Buffer(contents)});
        bundle.set(file.path, {code: file.contents});
        // self.bundle = {};
        callback(null, file)
      } else {
        callback(null, {path, contents})
      }
    }
    return gen(this);
  }
}
export default options => new Join(options);
