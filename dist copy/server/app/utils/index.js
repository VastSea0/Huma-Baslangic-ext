"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInteger = exports.relativeURLToAbsolute = exports.getProbableURL = exports.parseURL = exports.queryMatchesAny = exports.firstPromise = exports.clampNumber = exports.mergeClasses = void 0;
const tlds_json_1 = __importDefault(require("./tlds.json"));
/**
 * Combine multiple strings representing className lists.
 *
 * Falsey values are ignored, allowing for inline logic:
 *
 *     mergeClasses("something", props.isThing && "thing", props.className)
 *
 * @param classes Var args to merge
 * @returns resulting string
 */
function mergeClasses(...classes) {
    return classes.filter(c => c).join(" ");
}
exports.mergeClasses = mergeClasses;
/**
 * Returns `v` unless it is outside the range `min <= x <= max`,
 * in which case the closest of `min` and `max` is returned.
 *
 * @param v The number to clamp
 * @param min Min val
 * @param max Max val
 * @returns
 */
function clampNumber(v, min, max) {
    return Math.min(max, Math.max(v, min));
}
exports.clampNumber = clampNumber;
/**
 * Returns the result of the first promise that is successful, or undefined
 *
 * @param funcs
 * @returns
 */
async function firstPromise(funcs) {
    for (let i = 0; i < funcs.length; i++) {
        const func = funcs[i];
        if (func == false || func == undefined) {
            continue;
        }
        try {
            const value = await func();
            if (value != undefined) {
                return value;
            }
        }
        catch (_a) {
            continue;
        }
    }
    return undefined;
}
exports.firstPromise = firstPromise;
/**
 * Does query match any values in `args`?
 *
 * @param query
 * @param args
 * @returns
 */
function queryMatchesAny(query, ...args) {
    return query == "" ||
        args.some(x => x.toLowerCase().includes(query.toLowerCase()));
}
exports.queryMatchesAny = queryMatchesAny;
function parseURL(v) {
    try {
        return new URL(v);
    }
    catch (e) {
        return undefined;
    }
}
exports.parseURL = parseURL;
function getProbableURL(v) {
    const startsWithHttp = v.startsWith("http://") || v.startsWith("https://");
    const url = parseURL(startsWithHttp ? v : `http://${v}`);
    if (url && (startsWithHttp || v.endsWith("/") ||
        tlds_json_1.default.some(tld => url.hostname.endsWith(`.${tld}`)))) {
        return url.toString();
    }
    else {
        return null;
    }
}
exports.getProbableURL = getProbableURL;
function relativeURLToAbsolute(url, base) {
    if (!url) {
        return undefined;
    }
    return new URL(url, base).toString();
}
exports.relativeURLToAbsolute = relativeURLToAbsolute;
/**
 * Formats a number to an integer or "-" for undefined, without doing `-0`.
 * @param v the number
 * @returns An integer or `-` for undefined
 */
function formatInteger(v) {
    if (v == undefined) {
        return "-";
    }
    else if (v <= 0 && v > -0.5) {
        return "0";
    }
    else {
        return v.toFixed(0);
    }
}
exports.formatInteger = formatInteger;
//# sourceMappingURL=index.js.map