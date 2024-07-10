"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateExchangeRate = void 0;
/**
 * Calculates exchange rate from `from` to `to.
 *
 * ie: 1 `from` is how many `to`?
 *
 * @param currencies Dictionary of currency information
 * @param from
 * @param to
 * @returns Exchange rage
 */
function calculateExchangeRate(currencies, from, to) {
    const usdInFrom = currencies[from].value_in_usd;
    const usdInTo = currencies[to].value_in_usd;
    return usdInTo / usdInFrom;
}
exports.calculateExchangeRate = calculateExchangeRate;
//# sourceMappingURL=currencies.js.map