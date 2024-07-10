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
exports.getCurrencies = void 0;
const cache_1 = require("./cache");
const http_1 = __importStar(require("./http"));
const UserError_1 = __importDefault(require("./UserError"));
const config_1 = require("./config");
const metrics_1 = require("./metrics");
const shitCoins = new Set([
    "BTC", "ETH", "USDT", "BNB", "ADA", "DOGE", "XRP", "USDC", "DOT", "UNI",
]);
function checkError(response, json) {
    if (!response.ok || (json === null || json === void 0 ? void 0 : json.success) === false) {
        throw new UserError_1.default("Unknown error from upstream API");
    }
}
/**
 * Get info about symbols, like the description
 *
 * @returns Map of currency key to info
 */
async function fetchSymbols() {
    var _a;
    const url = new URL("http://api.exchangerate.host/list");
    url.searchParams.set("access_key", config_1.EXCHANGERATE_API_KEY);
    (0, metrics_1.notifyUpstreamRequest)("ExchangeRate.host");
    const response = await (0, http_1.default)(new http_1.Request(url, {
        method: "GET",
        size: 0.1 * 1000 * 1000,
        timeout: 10000,
        headers: {
            "User-Agent": config_1.UA_DEFAULT,
            "Accept": "application/json",
        },
    }));
    if (!((_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("application/json"))) {
        throw new UserError_1.default(await response.text());
    }
    const json = await response.json();
    checkError(response, json);
    const retval = {};
    Object.entries(json.currencies)
        .forEach(([key, description]) => {
        retval[key] = {
            code: key,
            description,
            value_in_usd: NaN,
            is_crypto: shitCoins.has(key),
        };
    });
    return retval;
}
async function fetchLiveValues(rates) {
    var _a;
    const url = new URL("http://api.exchangerate.host/live");
    url.searchParams.set("access_key", config_1.EXCHANGERATE_API_KEY);
    url.searchParams.set("base", "USD");
    url.searchParams.set("places", "10");
    (0, metrics_1.notifyUpstreamRequest)("ExchangeRate.host");
    // TODO: this API only returns BTC, use another API for crypto
    const response = await (0, http_1.default)(new http_1.Request(url, {
        method: "GET",
        timeout: 10000,
        headers: {
            "User-Agent": config_1.UA_DEFAULT,
            "Accept": "application/json",
        },
    }));
    if (!((_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("application/json"))) {
        throw new UserError_1.default(await response.text());
    }
    const json = await response.json();
    checkError(response, json);
    Object.entries(json.quotes).forEach(([key, value]) => {
        const withoutUSD = key.slice(3);
        rates[withoutUSD] = parseFloat(value);
    });
}
async function fetchCurrencies() {
    const symbols = await fetchSymbols();
    const rates = {};
    await fetchLiveValues(rates);
    rates["USD"] = 1;
    for (const key in symbols) {
        const currency = symbols[key];
        currency.value_in_usd = rates[key];
        if (!currency.value_in_usd || isNaN(currency.value_in_usd)) {
            delete symbols[key];
        }
    }
    return symbols;
}
exports.getCurrencies = (0, cache_1.makeSingleCache)(fetchCurrencies, 24 * 60);
//# sourceMappingURL=currencies.js.map