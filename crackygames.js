// ==UserScript==
// @name         CrackyGames script
// @namespace    local
// @version      1.1
// @match        https://*.crazygames.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const w = unsafeWindow;
    const exp = (f) => (typeof exportFunction === 'function' ? exportFunction(f, w) : f);

    function patch() {
        const sdk = w.CrazyGames && w.CrazyGames.SDK;
        const ad = sdk && sdk.ad;
        if (!ad || typeof ad.requestAd !== 'function' || ad.requestAd.__wrapped) return;

        const original = ad.requestAd;
        const wrapper = function (type, callbacks) {
            // Only rewarded ads are skipped; midgame ads behave normally
            if (type !== 'rewarded') return original.apply(ad, arguments);

            const call = (name) => {
                try { if (callbacks && typeof callbacks[name] === 'function') callbacks[name](); }
                catch (e) { console.error('[userscript] callback error', e); }
            };
            // Short delays so the game sees a normal start -> finish sequence
            setTimeout(() => call('adStarted'), 20);
            setTimeout(() => call('adFinished'), 80);
            console.log('[userscript] rewarded ad skipped, reward granted');
            return w.Promise.resolve();
        };
        try { wrapper.__wrapped = true; } catch (e) {}
        ad.requestAd = exp(wrapper);
        try { ad.requestAd.__wrapped = true; } catch (e) {}

        if (typeof ad.hasAdblock === 'function' && !ad.hasAdblock.__wrapped) {
            const h = exp(() => w.Promise.resolve(false));
            try { h.__wrapped = true; } catch (e) {}
            ad.hasAdblock = h;
        }
        console.log('[userscript] CG requestAd patched (v1.1)');
    }

    setInterval(patch, 250);
})();
