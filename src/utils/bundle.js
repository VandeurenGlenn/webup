'use strict';
import createEntrys from './create-entrys';
import { bundle } from './plugins-runner';
import { resolve, dirname, join, relative, sep as separator } from 'path';
import bundler from './bundler';
import { serialize } from 'parse5';
import writeFile from './write-file';
import { write } from 'sw-precache';

const forKey = (map, cb) => {
  for (const key of map.keys) {
    cb(key);
  }
}

const createExternal = map => {
  const arr = [];
  return forKey(map, key => {
    const imports = map.get(key).imports;
    if (imports)
      forKey(imports, key => {
        if (key.include('html_.js')) arr.push(key);
      });
  })
}

export default (map, options) => {
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

    const serviceWorker = options.serviceWorker || {
      dest: join(dirname(options.dest), 'service-worker.js'),
      stripPrefix: stripPrefixPath(),
      staticFileGlobs: []
    }
    // const external = map.forEach(({ imports }) => {
    //   if (imports) imports.forEach(importee => {
    //     if (importee.includes('html_.js')) {
    //
    //     }
    //   });
    // })

    const documents = await bundler(entrys, options);
    for (const id of documents.keys()) {
      serviceWorker.staticFileGlobs.push(productionPath(id));
      const done = await writeFile(productionPath(id), serialize(documents.get(id).ast));
    }
    if (serviceWorker) {
    // itterate trough map and add external css files to serviceWorkerSet
    // temporary workaround untill issue #4 is fixed
      for (const entry of map.entries()) {
        if (entry[0].match(/[a-z].css/)) {
          const path = productionPath(entry[0]);
          serviceWorker.staticFileGlobs.push(path);
          const done = await writeFile(path, entry[1].code.toString());
        }
      }
      write(serviceWorker.dest, serviceWorker);
    }
    // run bundle plugins if any
  }
  return gen();

};
