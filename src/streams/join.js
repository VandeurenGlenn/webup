'use strict';
import { Transform } from 'stream';

class Join extends Transform {
  constructor({inlineJs = false, inlineCss = false}) {
    super({objectMode: true});
    this.inlineJs = inlineJs;
    this.inlineCss = inlineCss;
    this.bundle = {};
  }

  joinCss(string, files) {
    // if (!files) return string;
    for (const file of files) {
      const { path, contents } = file;
      string = string.replace(
        `<link rel="stylesheet" href="${path}">`,
        `<style>${contents}</style>`
      );
    }
    return string;
  }

  joinJs(string, files) {
    // if (!files) return string;
    for (const file of files) {
      const { path, contents } = file;
      string = string.replace(
        `<script src="${path}"></script>`,
        `<script>${contents}</script>`
      );
    }
    // console.log(string);

    return string;
  }

  _transform({ path, contents }, encoding, callback) {
    // when splitted, css comes first, then js and then the host file itself.
    // Create a reference id by removing added extensions
    const id = path.replace('_.css', '').replace('_.js', '');
    // ensure contents is a string
    contents = contents.toString();
    this.bundle[id] = this.bundle[id] || {css: [], js: []};
    if (path.includes('.html_.css') && this.inlineCss) {
      // Store the file till parent comes trough.
      this.bundle[id].css.push({path: path, contents: contents});
      return callback(null, null);
    } else if (path.includes('.html_.js') && this.inlineJs) {
      // Store the file till parent comes trough.
      this.bundle[id].js.push({path: path, contents: contents});
      return callback(null, null);
    } else if (path.includes('.html')) {
      // inject styles
      if (this.inlineCss) {
        contents = this.joinCss(contents, this.bundle[id].css);
      }
      // inject scripts
      if (this.inlineJs) {
        contents = this.joinJs(contents, this.bundle[id].js);
      }

      this.bundle = {};

    }

    callback(null, {path: path, contents: new Buffer(contents)})
  }
}
export default options => new Join(options);
