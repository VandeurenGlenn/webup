import { Bundler } from 'polymer-bundler';
import { Analyzer } from 'polymer-analyzer';

// TODO: iterate through urloader(s) ?
export default (entrys, {
  cwd,
  inlineJs,
  inlineCss,
  exclude,
  rewriteUrlsInTemplates,
  stripComments,
  urlLoader,
  strategy,
  urlMapper
}) => {
  return new Promise((resolve, reject) => {

    const config = {
      excludes: exclude,
      inlineScripts: inlineJs,
      inlineCss: inlineCss,
      rewriteUrlsInTemplates: rewriteUrlsInTemplates,
      stripComments: stripComments
    }

    if (urlLoader) {
      config.analyzer = new Analyzer({
        urlLoader: urlLoader
      });;
    }

    if (strategy) {
      config.strategy = strategy;
    }

    if (urlMapper) {
      config.urlMapper = urlMapper;
    }

    const bundler = new Bundler(config);

    // TODO: Use more dep options
    bundler.generateManifest(entrys).then((manifest) => {
      bundler.bundle(manifest).then(result => resolve(result.documents));
    });
  });
}
