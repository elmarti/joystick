'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-baf978f7.js');

/*
 Stencil Client Patch Esm v2.12.1 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return index.promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return index.bootstrapLazy([], options);
  });
};

exports.defineCustomElements = defineCustomElements;
