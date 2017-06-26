'use strict';
import testImport from './test-import'

export default class Test extends HTMLElement {
  constructor() {
    super();
    testImport()
    console.log(testImport);
  }
}

customElements.define('test-element', Test)
