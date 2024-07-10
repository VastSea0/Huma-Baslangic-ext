"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCHANGERATE_API_KEY = exports.UNSPLASH_ACCESS_KEY = exports.ACCUWEATHER_API_KEY = exports.SAVE_ROOT = exports.SENTRY_DSN = exports.UA_PROXY = exports.UA_DEFAULT = exports.DISCORD_WEBHOOK = exports.IS_DEBUG = exports.serverConfig = exports.PORT = void 0;
const fs_1 = __importDefault(require("fs"));
exports.PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000;
exports.serverConfig = (function () {
    if (!fs_1.default.existsSync("config.json")) {
        return {};
    }
    return JSON.parse(fs_1.default.readFileSync("config.json").toString());
})();
exports.IS_DEBUG = process.env.NODE_ENV !== "production";
exports.DISCORD_WEBHOOK = (_b = process.env.DISCORD_WEBHOOK) !== null && _b !== void 0 ? _b : exports.serverConfig.DISCORD_WEBHOOK;
exports.UA_DEFAULT = "Mozilla/5.0 (compatible; Renewed Tab App/1.17.1; +https://renewedtab.com/)";
exports.UA_PROXY = "Mozilla/5.0 (compatible; Renewed Tab Proxy/1.17.1; +https://renewedtab.com/)";
exports.SENTRY_DSN = process.env.SENTRY_DSN;
exports.SAVE_ROOT = (_d = (_c = process.env.SAVE_ROOT) !== null && _c !== void 0 ? _c : exports.serverConfig.SAVE_ROOT) !== null && _d !== void 0 ? _d : ".";
exports.ACCUWEATHER_API_KEY = (_e = process.env.ACCUWEATHER_API_KEY) !== null && _e !== void 0 ? _e : exports.serverConfig.ACCUWEATHER_API_KEY;
exports.UNSPLASH_ACCESS_KEY = (_f = process.env.UNSPLASH_ACCESS_KEY) !== null && _f !== void 0 ? _f : exports.serverConfig.UNSPLASH_ACCESS_KEY;
exports.EXCHANGERATE_API_KEY = (_g = process.env.EXCHANGERATE_API_KEY) !== null && _g !== void 0 ? _g : exports.serverConfig.EXCHANGERATE_API_KEY;
//# sourceMappingURL=config.js.map