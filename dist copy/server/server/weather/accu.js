"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAccuError = void 0;
const UserError_1 = __importDefault(require("server/UserError"));
async function handleAccuError(response) {
    var _a;
    if (!((_a = response.headers.get("content-type")) !== null && _a !== void 0 ? _a : "").includes("application/json")) {
        const text = await response.text();
        throw new Error(`Invalid accuweather response: ${text}`);
    }
    const error = await response.json();
    console.log("Failed at ", response.url, ":", error);
    if (error.Message && error.Message.includes("requests has been exceeded")) {
        throw new UserError_1.default("Too many requests to Weather API service.");
    }
    else {
        console.log(error);
        throw new UserError_1.default(`Error getting weather, ${response.statusText}.`);
    }
}
exports.handleAccuError = handleAccuError;
//# sourceMappingURL=accu.js.map