var assert = require('assert');
var webup = require('./../dist/webup');

// TODO: check if all errors are covered (test errors)
describe('description', () => {
  // it('bundles module', (done) => {
  //   try {
  //     webup({entry: './test/module/test.js', dest: '.test/test.js'}).then(done());
  //     // done();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });

  // it('bundles html app using the default preset', (done) => {
  //   webup({
  //     entry: 'test/html/index.html',
  //     shell: 'test/html/test-app.html',
  //     dest: 'build/index.html',
  //     fragments: [
  //       'test/html/views/view-0.html',
  //       'test/html/views/view-1.html',
  //       'test/html/views/view-2.html',
  //       'test/html/views/view-3.html'
  //     ],
  //     presets: ['default'],
  //     // external: ['backed'],
  //     root: 'test/html',
  //     sources: ['./test/html/**/*']
  //   }).then(() => done()).catch((err) => done(err));
  // });

  // it('bundles html element using the default preset', (done) => {
  //   webup({
  //     entry: 'test/html/test-app.html',
  //     // shell: 'test/html/test-app.html',
  //     dest: 'build/element/index.html',
  //     element: true,
  //     fragments: [
  //       'test/html/views/view-0.html',
  //       'test/html/views/view-1.html',
  //       'test/html/views/view-2.html',
  //       'test/html/views/view-3.html'
  //     ],
  //     presets: ['default'],
  //     // external: ['backed'],
  //     root: 'test/html',
  //     sources: ['./test/html/**/*']
  //   }).then(() => done()).catch((err) => done(err));
  // });

  it('bundles html element using the default preset', (done) => {
    webup({
      entry: 'test/html/test-app.html',
      // shell: 'test/html/test-app.html',
      dest: 'build/element/test-app.html',
      presets: ['element'],
      // external: ['backed'],
      root: 'test/html',
      sources: ['./test/html/**/*']
    }).then(() => done()).catch((err) => done(err));
  });

  // it('bundles html using the http2 preset', (done) => {
  //   webup({
  //     entry: 'test/html/index.html',
  //     shell: 'test/html/test-app.html',
  //     dest: 'build/index.html',
  //     fragments: [
  //       'test/html/views/view-0.html',
  //       'test/html/views/view-1.html',
  //       'test/html/views/view-2.html',
  //       'test/html/views/view-3.html'
  //     ],
  //     presets: ['http2'],
  //     // external: ['backed'],
  //     // root: '.build',
  //     sources: ['./test/html/**/*']
  //   }).then(() => done()).catch((err) => done(err));
  // });

  // it('bundles html using the rollup preset', (done) => {
  //   webup({
  //     entry: 'test/html/index.html',
  //     shell: 'test/html/test-app.html',
  //     dest: 'build/rollup/index.html',
  //     fragments: [
  //       'test/html/views/view-0.html',
  //       'test/html/views/view-1.html',
  //       'test/html/views/view-2.html',
  //       'test/html/views/view-3.html'
  //     ],
  //     presets: [{
  //       plugins: ['rollup'],
  //       bundle: true
  //     }],
  //     // external: ['backed'],
  //     // root: '.build',
  //     sources: ['./test/html/**/*']
  //     // sources: ['./test/html/**/*']
  //   }).then(() => done()).catch((err) => done(err));
  // });

});
