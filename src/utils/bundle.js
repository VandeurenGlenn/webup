'use strict';
import createEntrys from './create-entrys';
import { bundle } from './plugins-runner';
import { resolve, dirname, join, relative, sep as separator } from 'path';
import bundler from './bundler';
import { serialize } from 'parse5';
import writeFile from './write-file';
import { write } from 'sw-precache';
import { createFilter } from 'rollup-pluginutils';

const isImage = require('is-image');
const isText = require('is-text-path');

Promise.properRace = promises => {
  if (promises.length < 1) {
    return Promise.reject('Can\'t start a race without promises!');
  }

  // There is no way to know which promise is rejected.
  // So we map it to a new promise to return the index when it fails
  let indexPromises = promises.map((p, index) => p.catch(() => {throw index;}));

  return Promise.race(indexPromises).catch(index => {
    // The promise has rejected, remove it from the list of promises and just continue the race.
    let p = promises.splice(index, 1)[0];
    if (promises.length === 0) {
      return Promise.reject('None resolved')
    }
    return Promise.properRace(promises);
  });
};

const _require = (file) => {
  return new Promise((resolve, reject) => {
    try {
      file = require(file);
    } catch (e) {
      reject(e);
    }
    resolve(file);
  });
}

const projectName = () => {
  return new Promise((resolve, reject) => {
    let errs = 0;
    const promises = [
      _require(join(process.cwd(), 'bower.json')),
      _require(join(process.cwd(), 'package.json')),
      _require(join(process.cwd(), 'webup.json)'))
    ]
    Promise.properRace(promises).then(({ name }) => {
      resolve(name);
    }).catch((err) => {
      errs++;
      if (errs === 3) {
        console.warn('bower.json, package.json, webup.json not found', err);
        resolve(dirname(__dirname));
      }
    });
  });
}

export default (map, options) => {
  const filter = createFilter(options.external, options.exclude);
  const external = (id, options = {text: true, image: true}) => {
    // id = join()
    if (filter(id)) {
      if (options.image && isImage(id)) return true;
      else if (options.text && isText(id)) return true;
      else if(!options.text && !options.image) return true;
    }
    return false;
  }

  async function gen() {
    options.root = resolve(dirname(options.entry));
    // TODO: seperate map per entry.
    // return relative path untill [issue](https://github.com/Polymer/polymer-bundler/issues/521) is fixed
    const entrys = createEntrys(options).map(url => {
      return relative(options.root, url)
    });

    const productionPath = path => {
      return join(dirname(options.dest), path);
    }

    const stripPrefixPath = () => {
      let path = '';
      for (const string of productionPath('').split(separator)) {
        path += `${string}/`;
      }
      return path;
    }

    const name = await projectName();

    const serviceWorker = options.serviceWorker === false ? false : options.serviceWorker || {
      dest: join(dirname(options.dest), 'service-worker.js'),
      stripPrefix: stripPrefixPath(),
      cacheId: name,
      staticFileGlobs: [],
      clientsClaim: true
    }

    const documents = await bundler(entrys, options);
    for (const id of documents.keys()) {
      if (serviceWorker) {
        serviceWorker.staticFileGlobs.push(productionPath(id));
      }
      const done = await writeFile(productionPath(id), serialize(documents.get(id).ast));
    }
    // temporary workaround untill issue #4 is fixed
    // itterate trough map and add external css files to staticFileGlobs & write to build
    for (const entry of map.entries()) {
      if (external(entry[1].originalPath) || entry[0].match(/[a-z].css/)) {
        const path = productionPath(entry[0]);
        if (serviceWorker) {
          serviceWorker.staticFileGlobs.push(path);
        }
        const done = await writeFile(path, entry[1].code.toString());
      }
    }
    if (serviceWorker) {
      write(serviceWorker.dest, serviceWorker);
    }
    // run bundle plugins if any
  }
  return gen();

};
