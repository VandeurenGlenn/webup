# Webup

> yet another builder/bundler for the web

## Setup


## Info
Webup is actually quite lazy and only concerns about reading, joining, splitting, etc... .

Instead it relies on plugins & presets to do the heavy work (he even doesn't concern bundling by default, jeez).

## Usage

### Node

```js
webup({
  entry: 'index.html',
  shell: 'my-app.html',
  dest: 'build/index.html',
  sources: ['./test/html/**/*']
});
```

## API
### webup(options);

#### entry
Type: `string`<br>
Default: `null`<br>

The entry point of your app (usually index.html).

#### shell
Type: `string`<br>
Default: `null`<br>

An app shell containing the basic layout of your app (like my-app.html).

#### dest
Type: `string`<br>
Default: `null`<br>

The destination to write the result to.

#### sources
Type: `array`<br>
Default: `[]`<br>

App sources, dependencies, etc ...

#### plugins
Type: `array`<br>
Default: `[]`<br>

An array containing plugins.

#### presets
Type: `array`<br>
Default: `['default']`<br>

An array containing presets.

**note: Webup does nothing when no presets defined**

### building
> read, clean, split, plugins, join, write

### Bundling
> read, bundler, clean, plugins, write


## Presets
- [webup-preset-default]() The default preset used to create a unbundled & bundled build.

## Plugins
- [webup-plugin-default]() Example for creating a plugin yourself.
- [webup-plugin-split]() Plugin for handling splitted html, css & js paths.

## TODO
- [ ] Finish readme
- [ ] Create wiki
