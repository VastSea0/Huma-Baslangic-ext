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
exports.fetchRetry = exports.Response = exports.Request = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const UserError_1 = __importDefault(require("./UserError"));
const metrics_1 = require("./metrics");
var node_fetch_2 = require("node-fetch");
Object.defineProperty(exports, "Request", { enumerable: true, get: function () { return node_fetch_2.Request; } });
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return node_fetch_2.Response; } });
async function fetchCatch(url, init) {
    try {
        init = init !== null && init !== void 0 ? init : {};
        if (!init.timeout) {
            init.timeout = 20000;
        }
        return await (0, node_fetch_1.default)(url, init);
    }
    catch (e) {
        let host = "?";
        if (typeof (url) == "string") {
            host = new URL(url).host;
        }
        else if (url instanceof node_fetch_1.Request) {
            const request = url;
            host = new URL(request.url).host;
        }
        throw new UserError_1.default(`Error whilst connecting to ${host}`);
    }
}
exports.default = fetchCatch;
function isSporadicError(e) {
    const msg = String(e);
    return msg.includes("error whilst connecting to") ||
        msg.includes("response timeout while trying to fetch") ||
        msg.includes("internal service error") ||
        msg.includes("service unavailable");
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function fetchRetry(url, init) {
    let tries = 3;
    while (1) {
        tries--;
        try {
            return await fetchCatch(url, init);
        }
        catch (e) {
            if (!isSporadicError(e) || tries == 0) {
                throw e;
            }
            await sleep(200);
            const urlO = new URL(url.toString());
            (0, metrics_1.notifyUpstreamRetry)(urlO.hostname);
        }
    }
    // This is unreachable
    throw null;
}
exports.fetchRetry = fetchRetry;
//# sourceMappingURL=http.js.map