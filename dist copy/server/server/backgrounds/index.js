"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackground = void 0;
const unsplash_1 = __importDefault(require("./unsplash"));
const config_1 = require("server/config");
let cache = null;
async function fillCache() {
    const images = [];
    for (let i = 0; i < 4; i++) {
        images.push(await (0, unsplash_1.default)("42576559"));
    }
    cache = images;
    return cache;
}
if (!config_1.IS_DEBUG) {
    setInterval(() => {
        fillCache().catch(console.error);
    }, 15 * 60 * 1000);
}
async function getBackground() {
    if (cache) {
        return cache;
    }
    try {
        return await fillCache();
    }
    catch (e) {
        console.error(e);
        return [{
                id: "unsplash:comjArgHF4Y",
                title: "Valdez, United States",
                color: "#404059",
                url: "https://images.unsplash.com/photo-1533756972958-d6f38a9761e3?ixid=MnwyMTM1ODB8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MTU0ODI1MjQ&ixlib=rb-1.2.1&w=1920&h=1080",
                author: "Chad Peltola",
                site: "Unsplash",
                links: {
                    photo: "https://unsplash.com/photos/comjArgHF4Y?utm_source=renewedtab&utm_medium=referral",
                    author: "https://unsplash.com/@chadpeltola?utm_source=renewedtab&utm_medium=referral",
                    site: "https://unsplash.com?utm_source=renewedtab&utm_medium=referral",
                },
            }];
    }
}
exports.getBackground = getBackground;
getBackground().catch(console.error);
//# sourceMappingURL=index.js.map