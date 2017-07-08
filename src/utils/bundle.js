'use strict';
import createEntrys from './create-entrys';
import { bundle } from './plugins-runner';
import { resolve, dirname, join, relative } from 'path';
import bundler from './bundler';
import { serialize } from 'parse5';
import writeFile from './write-file';

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

    const external = options.external || [];

    // const external = createExternal(map);
    // add html_.js files to external
    for (const key of map.keys()) {
      const url = map.get(key);
      if (key.includes('html_.js')) {
        external.push(key)
      }
    }

    options.external = external;
    // const external = map.forEach(({ imports }) => {
    //   if (imports) imports.forEach(importee => {
    //     if (importee.includes('html_.js')) {
    //
    //     }
    //   });
    // })

    // console.log(map);
    for (const path of external) {
      await bundle({path, map: map.get(path), external}, options.plugins);
    }

    const documents = await bundler(entrys, options);
    for (const id of documents.keys()) {
      const done = await writeFile(join(dirname(options.dest), id), serialize(documents.get(id).ast));
    }
    // run bundle plugins if any
  }
  return gen();

};
