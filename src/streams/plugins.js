'use strict';
import { Transform } from 'stream';

class Plugins extends Transform {
  constructor({plugins}) {
    super({objectMode: true});
    this.plugins = plugins;
  }

  _transform(file, encoding, callback) {
    async function gen(self) {
      try {
        for (const plugin of self.plugins) {
          // TODO: add error handler for when path or contents aren't defined.
          if (file.path.includes('.css') && plugin.css) {
            file = await plugin.css(file);
          } else if (file.path.includes('.js') && plugin.js) {
            file = await plugin.js(file);
          } else if (file.path.includes('.html') &&
                    !file.path.includes('.html_') && plugin.html) {
            file = await plugin.html(file);
          }
        }
        callback(null, file);
      } catch (error) {
        throw error;
      }
    }
    gen(this);
  }
}
export default options => new Plugins(options);
