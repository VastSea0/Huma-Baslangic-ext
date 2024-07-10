"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumToString = exports.enumToValue = void 0;
function enumToValue(e, value) {
    return typeof value == "number" ? value : e[value];
}
exports.enumToValue = enumToValue;
function enumToString(e, value) {
    return typeof value == "string" ? value : e[value];
}
exports.enumToString = enumToString;
//# sourceMappingURL=enum.js.map