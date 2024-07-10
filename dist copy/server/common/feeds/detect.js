"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFeed = void 0;
const _1 = require(".");
const LINK_SELECTOR = [
    "link[type='application/rss+xml']",
    "link[type='application/atom+xml']",
    "link[rel='alternate'][href$='.rss']",
    "link[rel='alternate'][href$='atom.xml']",
].join(", ");
async function impl(url, loader, depth) {
    if (depth > 1) {
        return [];
    }
    const root = await loader(url);
    if (!root) {
        console.log("- no root");
        return [];
    }
    console.log(root.tagName);
    if (root.tagName == "rss") {
        return [
            {
                type: _1.FeedType.Rss,
                url: url,
                title: "",
                numberOfArticles: 0,
                numberOfImages: 0,
            }
        ];
    }
    else if (root.tagName == "feed") {
        return [
            {
                type: _1.FeedType.Atom,
                url: url,
                title: "",
                numberOfArticles: 0,
                numberOfImages: 0,
            }
        ];
    }
    else if (root.tagName == "HTML") {
        const links = root.querySelectorAll(LINK_SELECTOR);
        console.log([...links].map(x => x.outerHTML));
        if (links.length > 0) {
            const res = await Promise.allSettled([...links].map(async (link) => {
                const linkUrl = new URL(link.getAttribute("href"), url).toString();
                return (await impl(linkUrl, loader, depth + 1)).map(x => { var _a; return ({ ...x, title: (_a = link.getAttribute("title")) !== null && _a !== void 0 ? _a : x.title }); });
            }));
            return res.filter(x => x.status == "fulfilled")
                .flatMap(x => x.value);
        }
    }
    return [];
}
/**
 * Attempts to find RSS/Atom feed at URL
 *
 * @param url Url to check
 */
async function detectFeed(url, loader) {
    return await impl(url, loader, 0);
}
exports.detectFeed = detectFeed;
//# sourceMappingURL=detect.js.map