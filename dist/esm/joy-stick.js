import { p as promiseResolve, b as bootstrapLazy } from './index-d5a13232.js';

/*
 Stencil Client Patch Browser v2.12.1 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = import.meta.url;
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return promiseResolve(opts);
};

patchBrowser().then(options => {
  return bootstrapLazy([], options);
});
