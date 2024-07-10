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
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importStar(require("../http"));
const metrics_1 = require("server/metrics");
const UserError_1 = __importDefault(require("server/UserError"));
const config_1 = require("server/config");
async function getImageFromUnsplash(collection) {
    var _a;
    if (config_1.UNSPLASH_ACCESS_KEY == "") {
        throw new UserError_1.default("Missing unsplash key");
    }
    const url = new URL("https://api.unsplash.com/photos/random");
    url.searchParams.set("collections", collection);
    (0, metrics_1.notifyUpstreamRequest)("Unsplash.com");
    const response = await (0, http_1.default)(new http_1.Request(url, {
        method: "GET",
        headers: {
            "User-Agent": config_1.UA_DEFAULT,
            "Accept": "application/json",
            "Authorization": `Client-ID ${config_1.UNSPLASH_ACCESS_KEY}`
        }
    }));
    const text = await response.text();
    if (text.startsWith("Rate Limit")) {
        throw new UserError_1.default("Unsplash rate limit exceeded");
    }
    const image = JSON.parse(text);
    return {
        id: `unsplash:${image.id}`,
        title: (_a = image.location) === null || _a === void 0 ? void 0 : _a.title,
        color: image.color,
        url: image.urls.raw + "&w=2048&h=1117&crop=entropy&fit=crop",
        author: image.user.name,
        site: "Unsplash",
        links: {
            photo: image.links.html + "?utm_source=renewedtab&utm_medium=referral",
            author: image.user.links.html + "?utm_source=renewedtab&utm_medium=referral",
            site: "https://unsplash.com?utm_source=renewedtab&utm_medium=referral",
        },
    };
}
exports.default = getImageFromUnsplash;
//# sourceMappingURL=unsplash.js.map