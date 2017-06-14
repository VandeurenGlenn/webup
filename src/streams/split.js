'use strict';
import { Transform } from 'stream';
import { dirname } from 'path';
import { warn } from './../utils/logger';

import { queryAll } from 'dom5';
import { parse } from 'parse5';
import vinylFile from 'vinyl';

class Source extends Transform {
  constructor() {
    super({objectMode: true});
    this.css = [];
    this.js = [];
    // this.on('finish', () => {
    //   this.pushFiles(this.css);
    //   this.pushFiles(this.js);
    // });
  }

  pushFiles(files) {
    for (const file of files) {
      this.push(new vinylFile(file));
    }
  }

  _transform(file, encoding, callback) {
    if (file.path.includes('.html')) {
      file.contents = this.split(file);
    }
    callback(null, file);
  }

  queryStyles(node) {
    if (node.tagName === 'style'  || node.tagName === 'template') {
      return node;
    }
  }

  queryScripts(node) {
    if (node.tagName === 'script' || node.tagName === 'template') {
      return node;
    }
  }

  split(file) {
    let { contents } = file;
    const { path } = file;

    // convert buffer to string
    contents = contents.toString();

    // parse the html
    const doc = parse(contents);

    // query styles
    let styles = queryAll(doc, this.queryStyles)
    styles = styles.map(node => {
      if ( node && node.tagName === 'template') {
        for (const child of node.content.childNodes) {
          if (child.tagName === 'style') {
            return child;
          }
        }
      } else if (node.tagName === 'style') {
        return node
      };
    });

    // query scripts
    let scripts = queryAll(doc, this.queryScripts)
    scripts = scripts.map(node => {
      if ( node && node.tagName === 'template') {
        for (const child of node.content.childNodes) {
          if (child.tagName === 'script') {
            const index = scripts.indexOf(node);
            return child;
          }
        }
      } else if (node.tagName === 'script') {
        return node;
      };
    });

    // handle queried scripts
    for (const script of scripts) {
      // handle inline script
      if (script && script.childNodes && script.childNodes.length > 0) {
        const content = script.childNodes[0].value;
        this.js.push({path: `${path}_.js`, contents: new Buffer(content)});
        contents = contents.replace(
          `<script>${content}</script>`,
          `<script src="${path}_.js"></script>`
        );
      }

    }

    // handle queried styles
    for (const style of styles) {
      // handle inline style
      if (style && style.childNodes && style.childNodes.length > 0) {
        const content = style.childNodes[0].value;
        this.css.push({path: `${path}_.css`, contents: new Buffer(content)});
        contents = contents.replace(
          `<style>${content}</style>`,
          `<link rel="stylesheet" href="${path}_.css">`
        );
      }
    }

    // push css & js to the stream
    this.pushFiles(this.css);
    this.pushFiles(this.js);

    return new Buffer(contents);
  }
}

export default path => new Source(path);
