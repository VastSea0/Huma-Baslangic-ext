"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuote = exports.getQuoteCategories = void 0;
const cache_1 = require("./cache");
async function getQuoteCategories() {
    return [
        {
            "id": "inspire",
            "text": "Inspiring"
        },
    ];
}
exports.getQuoteCategories = getQuoteCategories;
const quotes_json_1 = __importDefault(require("./data/quotes.json"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchQuotes(_category) {
    // TODO: use quote API
    // Random quote
    const quote = quotes_json_1.default[Math.floor(Math.random() * quotes_json_1.default.length)];
    return [
        {
            "text": quote.quote,
            "author": quote.author,
        }
    ];
}
exports.getQuote = (0, cache_1.makeKeyCache)(fetchQuotes, 8 * 60);
//# sourceMappingURL=quotes.js.map