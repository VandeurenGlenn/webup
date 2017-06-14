var assert = require('assert');
var webup = require('./../dist/webup');

describe('description', () => {
  // it('bundles module', (done) => {
  //   try {
  //     webup({entry: './test/module/test.js', dest: '.test/test.js'}).then(done());
  //     // done();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });

  it('bundles html using the default preset', (done) => {
    webup({
      entry: 'index.html',
      shell: 'test-app.html',
      dest: 'build/index.html',
      fragments: [
        'views/view-0.html',
        'views/view-1.html',
        'views/view-2.html',
        'views/view-3.html'
      ],
      presets: ['default', 'http2'],
      // external: ['backed'],
      // root: '.build',
      cwd: `${__dirname}/html`,
      sources: ['./test/html/**/*']
    }).then(() => done()).catch((err) => console.log(err));
  });

  it('bundles html using the http2 preset', (done) => {
    webup({
      entry: 'index.html',
      shell: 'test-app.html',
      dest: 'build/index.html',
      fragments: [
        'views/view-0.html',
        'views/view-1.html',
        'views/view-2.html',
        'views/view-3.html'
      ],
      presets: ['http2'],
      // external: ['backed'],
      // root: '.build',
      cwd: `${__dirname}/html`,
      sources: ['./test/html/**/*']
    }).then(() => done()).catch((err) => console.log(err));
  });


});
