// ==UserScript==
// @name         Pwnki script
// @namespace    local
// @version      1.3
// @match        https://*.poki.com/*
// @match        https://*.poki-gdn.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const w = unsafeWindow;
    const exp = (f) => (typeof exportFunction === 'function' ? exportFunction(f, w) : f);

    // Set to false if you want normal (non-rewarded) ad breaks left alone
    const SKIP_COMMERCIAL_BREAKS = true;

    // Poki accepts either a function or { onStart, size } as the argument
    function fireOnStart(arg) {
        try {
            const fn = typeof arg === 'function' ? arg : (arg && arg.onStart);
            if (typeof fn === 'function') fn();
        } catch (e) { console.error('[userscript] onStart error', e); }
    }

    function wrap(sdk, name, result) {
        const fn = sdk[name];
        if (typeof fn !== 'function' || fn.__wrapped) return;
        const wrapper = function (arg) {
            setTimeout(() => fireOnStart(arg), 20);
            console.log('[userscript]', name, 'skipped');
            return w.Promise.resolve(result);
        };
        try { wrapper.__wrapped = true; } catch (e) {}
        sdk[name] = exp(wrapper);
        try { sdk[name].__wrapped = true; } catch (e) {}
        console.log('[userscript]', name, 'patched (v1.3)');
    }

    function patch() {
        const sdk = w.PokiSDK;
        if (!sdk) return;
        wrap(sdk, 'rewardedBreak', true);
        if (SKIP_COMMERCIAL_BREAKS) wrap(sdk, 'commercialBreak', undefined);
    }

    setInterval(patch, 250);
})();
