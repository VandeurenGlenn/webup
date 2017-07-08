import { Bundler } from 'polymer-bundler';
import { Analyzer } from 'polymer-analyzer';
import globals from './globals';
import {join, resolve as resolvePath, relative, normalize, isAbsolute } from 'path'

export default (entrys, {
  inlineJs = true,
  inlineCss = true,
  exclude,
  rewriteUrlsInTemplates = false,
  stripComments = true,
  analyzer,
  strategy,
  urlMapper,
  root
}) => {
  return new Promise((resolve, reject) => {

    const config = {
      excludes: exclude,
      inlineScripts: inlineJs,
      inlineCss: inlineCss,
      rewriteUrlsInTemplates: rewriteUrlsInTemplates,
      stripComments: stripComments
    }

    if (strategy) {
      config.strategy = strategy;
    }

    if (urlMapper) {
      config.urlMapper = urlMapper;
    }

    class FakeFsUrlLoader {
      constructor(files, root) {
        this.files = files;
      }

      canLoad(url) {
        url = normalize(url);
        const canLoad = Boolean(this.files.has(url));
        if (!canLoad && isAbsolute(url)) {
          this.url = relative(root, url);
        } else {
          this.url = url;
          return canLoad;
        }
        return Promise.resolve(Boolean(this.files.has(this.url)));
      }

      load(url) {
        return this.files.get(this.url).toString();
      }
    }

    config.analyzer = new Analyzer({
      urlLoader: new FakeFsUrlLoader(globals('bundleMap'), root)
    });

    const bundler = new Bundler(config);
    // TODO: Use more dep options
    bundler.generateManifest(entrys).then((manifest) => {
      bundler.bundle(manifest).then(result => resolve(result.documents));
    });
  });
}
