"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeKeyCache = exports.makeSingleCache = void 0;
const config_1 = require("./config");
/**
 *
 * @param func Function to be cached
 * @param timeout In minutes
 * @returns Function with same signature as `func`, but cached
 */
function makeSingleCache(func, timeout) {
    let cache = undefined;
    if (!config_1.IS_DEBUG) {
        setInterval(() => {
            cache = undefined;
        }, timeout * 60 * 1000);
    }
    return (...args) => {
        if (cache) {
            return cache;
        }
        const ret = func(...args);
        cache = ret;
        if (ret instanceof Promise) {
            ret.catch((e) => {
                console.error(e);
                cache = undefined;
            });
        }
        return ret;
    };
}
exports.makeSingleCache = makeSingleCache;
/**
 * Wraps a function `func` with in-memory caching
 *
 * @param func Function to be cached
 * @param timeout In minutes
 * @param getKey Function to get caching key from arguments passed to `func`.
 *     Defaults to .toString() of first argument.
 * @returns Function with same signature as `func`, but cached
 */
function makeKeyCache(func, timeout, getKey = (x) => x.toString()) {
    const cache = new Map();
    if (!config_1.IS_DEBUG && timeout != 0) {
        setInterval(() => {
            cache.clear();
        }, timeout * 60 * 1000);
    }
    return (...args) => {
        const key = getKey(...args);
        console.log(`key is ${key}`);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const ret = func(...args);
        cache.set(key, ret);
        if (ret instanceof Promise) {
            ret.catch((e) => {
                console.error(e);
                cache.delete(key);
            });
        }
        return ret;
    };
}
exports.makeKeyCache = makeKeyCache;
//# sourceMappingURL=cache.js.map