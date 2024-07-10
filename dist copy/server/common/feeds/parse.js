"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFeed = void 0;
const uuid_1 = __importDefault(require("app/utils/uuid"));
const utils_1 = require("../../app/utils");
const dates_1 = require("../../app/utils/dates");
function cleanURL(url) {
    if (url.startsWith("//")) {
        return "https://" + url.slice(2);
    }
    else {
        return url;
    }
}
function escapeHTMLtoText(html, parseXML) {
    const root = parseXML(`<span>${html}</span>`, "text/html");
    return root.children[0].textContent;
}
function getImage(el, parseXML) {
    var _a, _b, _c, _d, _e;
    const enclosure = el.querySelector("enclosure[type^='image/'][url]");
    if (enclosure) {
        return [cleanURL(enclosure.getAttribute("url")), undefined];
    }
    const mediaGroup = Array.from(el.getElementsByTagName("media:content"))
        .filter(x => x.getAttribute("url") &&
        (!x.hasAttribute("medium") || x.getAttribute("medium") == "image"));
    if (mediaGroup.length > 0) {
        return [cleanURL(mediaGroup[0].getAttribute("url")), undefined];
    }
    const tags = el.querySelector("StoryImage, fullimage");
    if (tags && tags.textContent) {
        return [cleanURL(tags.textContent), undefined];
    }
    const html = (_d = (_b = (_a = el.getElementsByTagName("content:encoded")[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : (_c = el.querySelector("description, summary, content")) === null || _c === void 0 ? void 0 : _c.textContent) !== null && _d !== void 0 ? _d : undefined;
    if (!html) {
        return undefined;
    }
    const imgs = Array.from(parseXML(html, "text/html").querySelectorAll("img[src]"))
        .filter(x => { var _a; return !((_a = x.getAttribute("src")) === null || _a === void 0 ? void 0 : _a.startsWith("http://feeds.feedburner.com/~ff/rss/")); });
    if (imgs.length == 0) {
        return undefined;
    }
    return [cleanURL(imgs[0].getAttribute("src")), (_e = imgs[0].getAttribute("alt")) !== null && _e !== void 0 ? _e : ""];
}
function getChildrenWithTagName(root, tagname) {
    return Array.from(root.getElementsByTagName(tagname)).filter(x => x.parentElement == root);
}
function parseRSSFeed(root, baseURL, parseXML) {
    var _a, _b, _c;
    const feed = {
        title: (_b = (_a = root.querySelector("channel > title")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : undefined,
        link: (0, utils_1.relativeURLToAbsolute)((_c = root.querySelector("channel > link")) === null || _c === void 0 ? void 0 : _c.textContent, baseURL),
        articles: [],
    };
    root.querySelectorAll("item").forEach(el => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const img = getImage(el, parseXML);
        const title = (_a = el.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent;
        if (!title) {
            return;
        }
        const link = (0, utils_1.relativeURLToAbsolute)((_c = (_b = el.querySelector("link")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim(), baseURL);
        const id = (_g = (_f = (_e = (_d = el.querySelector("guid")) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : link) !== null && _g !== void 0 ? _g : (0, uuid_1.default)();
        feed.articles.push({
            id,
            title: escapeHTMLtoText(title, parseXML).trim(),
            link,
            image: (0, utils_1.relativeURLToAbsolute)(img === null || img === void 0 ? void 0 : img[0], baseURL),
            alt: img === null || img === void 0 ? void 0 : img[1],
            date: (0, dates_1.parseDate)((_k = (_j = (_h = el.querySelector("pubDate")) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : undefined),
            feed: feed
        });
    });
    return feed;
}
function parseAtomFeed(root, baseURL, parseXML) {
    var _a, _b, _c;
    const rootLinks = getChildrenWithTagName(root, "link");
    const linkEle = (_a = rootLinks.find(x => { var _a; return (_a = x.getAttribute("type")) === null || _a === void 0 ? void 0 : _a.includes("html"); })) !== null && _a !== void 0 ? _a : rootLinks.find(x => x.getAttribute("rel") == "alternate");
    const feed = {
        title: (_c = (_b = getChildrenWithTagName(root, "title")[0]) === null || _b === void 0 ? void 0 : _b.textContent) !== null && _c !== void 0 ? _c : undefined,
        link: (0, utils_1.relativeURLToAbsolute)(linkEle === null || linkEle === void 0 ? void 0 : linkEle.getAttribute("href"), baseURL),
        articles: [],
    };
    root.querySelectorAll("entry").forEach(el => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const img = getImage(el, parseXML);
        const title = (_a = el.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent;
        if (!title) {
            return;
        }
        const link = (_c = (_b = el.querySelector("link:not([rel='enclosure'])")) === null || _b === void 0 ? void 0 : _b.getAttribute("href")) === null || _c === void 0 ? void 0 : _c.trim();
        const id = (_g = (_f = (_e = (_d = el.querySelector("id")) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : link) !== null && _g !== void 0 ? _g : (0, uuid_1.default)();
        feed.articles.push({
            id,
            title: escapeHTMLtoText(title, parseXML).trim(),
            link: (0, utils_1.relativeURLToAbsolute)(link, baseURL),
            image: (0, utils_1.relativeURLToAbsolute)(img === null || img === void 0 ? void 0 : img[0], baseURL),
            alt: img === null || img === void 0 ? void 0 : img[1],
            date: (0, dates_1.parseDate)((_k = (_j = (_h = el.querySelector("updated")) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : undefined),
            feed: feed,
        });
    });
    return feed;
}
function parseJSONFeed(json, baseURL, parseXML) {
    const feed = {
        title: json.title,
        link: (0, utils_1.relativeURLToAbsolute)(json.home_page_url, baseURL),
        articles: [],
    };
    feed.articles = json.items.map(item => {
        var _a, _b, _c, _d;
        const link = (0, utils_1.relativeURLToAbsolute)(item.url, baseURL);
        const id = (_b = (_a = item.id) !== null && _a !== void 0 ? _a : link) !== null && _b !== void 0 ? _b : (0, uuid_1.default)();
        return {
            id,
            title: (_d = (_c = item.title) !== null && _c !== void 0 ? _c : item.content_text) !== null && _d !== void 0 ? _d : escapeHTMLtoText(item.content_html, parseXML),
            link,
            image: (0, utils_1.relativeURLToAbsolute)(item.image, baseURL),
            date: (0, dates_1.parseDate)(item.date_published),
            feed: feed,
        };
    });
    return feed;
}
function parseFeed(body, baseURL, parseXML) {
    let json;
    try {
        json = JSON.parse(body);
    }
    catch (e) {
        if (!(e instanceof SyntaxError)) {
            throw e;
        }
        json = undefined;
    }
    if (json) {
        return parseJSONFeed(json, baseURL, parseXML);
    }
    const document = parseXML(body, "application/xml");
    const root = document.children[0];
    if (root.tagName == "rss" || root.tagName.toLowerCase().includes("rdf")) {
        return parseRSSFeed(root, baseURL, parseXML);
    }
    else if (root.tagName == "feed") {
        return parseAtomFeed(root, baseURL, parseXML);
    }
    else {
        return null;
    }
}
exports.parseFeed = parseFeed;
//# sourceMappingURL=parse.js.map