"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProxy = void 0;
const http_1 = __importStar(require("./http"));
const data_1 = require("./data");
const cache_1 = require("./cache");
const UserError_1 = __importDefault(require("./UserError"));
const config_1 = require("./config");
const PROXY_ALLOWED_HOSTS_SET = new Set((_a = config_1.serverConfig.PROXY_ALLOWED_HOSTS) !== null && _a !== void 0 ? _a : []);
[
    ...data_1.autocompleteFeeds,
    ...data_1.autocompleteWebcomics,
    ...data_1.autocompleteBackgroundFeeds,
].map(x => new URL(x.value).hostname).forEach(x => PROXY_ALLOWED_HOSTS_SET.add(x));
const PROXY_ALLOWED_HOSTS = [...PROXY_ALLOWED_HOSTS_SET];
console.log(PROXY_ALLOWED_HOSTS);
function checkProxyURL(url) {
    const hostAllowed = PROXY_ALLOWED_HOSTS.some(other => url.hostname == other || url.hostname.endsWith("." + other));
    if (!hostAllowed) {
        throw new UserError_1.default(`Accessing host ${url.hostname} is not allowed on the web version. ` +
            `For security reasons, the web version may only access pre-approved domains. ` +
            `Consider using the Chrome/Firefox/Edge extension instead.`);
    }
}
async function fetchProxy(url) {
    var _a;
    checkProxyURL(url);
    const response = await (0, http_1.default)(new http_1.Request(url, {
        method: "GET",
        size: 1 * 1000 * 1000,
        timeout: 10000,
        headers: {
            "User-Agent": config_1.UA_PROXY,
            "Accept": "application/json, application/xml, text/xml, application/rss+xml, application/atom+xml",
        },
    }));
    if (!response.ok) {
        return {
            status: response.status,
            text: response.statusText,
            contentType: "text/plain",
        };
    }
    const retval = {
        status: response.status,
        text: await response.text(),
        contentType: (_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain",
    };
    return retval;
}
exports.handleProxy = (0, cache_1.makeKeyCache)(fetchProxy, 15);
//# sourceMappingURL=proxy.js.map