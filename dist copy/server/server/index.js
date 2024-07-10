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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = __importStar(require("./http"));
const Sentry = __importStar(require("@sentry/node"));
const Tracing = __importStar(require("@sentry/tracing"));
const config_1 = require("./config");
// App
const app = (0, express_1.default)();
Sentry.init({
    enabled: config_1.SENTRY_DSN != undefined,
    dsn: config_1.SENTRY_DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
    ],
    beforeSend(event) {
        var _a, _b;
        // Drop expected UserError exceptions
        if (((_b = (_a = event.exception) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : []).some(x => x.type == "UserError")) {
            return null;
        }
        return event;
    }
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((_req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});
function writeClientError(res, msg) {
    res.status(400).type("text").send(msg);
}
const metrics_1 = require("./metrics");
const UserError_1 = __importDefault(require("./UserError"));
const feeds_1 = require("common/feeds");
const detect_1 = require("common/feeds/detect");
const jsdom_1 = require("jsdom");
const proxy_1 = require("./proxy");
const weather_1 = require("./weather");
const backgrounds_1 = require("./backgrounds");
const geocode_1 = require("./weather/geocode");
const unsplash_1 = __importDefault(require("./backgrounds/unsplash"));
const quotes_1 = require("./quotes");
const currencies_1 = require("./currencies");
const data_1 = require("./data");
app.get('/metrics', async (req, res) => {
    try {
        const metrics = await metrics_1.promRegister.metrics();
        res.set('Content-Type', metrics_1.promRegister.contentType);
        res.send(metrics);
    }
    catch (ex) {
        res.statusCode = 500;
        res.send(ex.message);
    }
});
app.get("/proxy/", async (req, res, next) => {
    try {
        if (!req.query.url) {
            writeClientError(res, "Missing URL");
            return;
        }
        (0, metrics_1.notifyAPIRequest)("proxy");
        const url = new URL(req.query.url);
        const result = await (0, proxy_1.handleProxy)(url);
        res.status(result.status)
            .setHeader("Cache-Control", "max-age=300")
            .type(result.contentType).send(result.text);
    }
    catch (e) {
        next(e);
    }
});
function parseLocation(req) {
    if (typeof req.query.long != "string" || typeof req.query.lat != "string") {
        return null;
    }
    const location = {
        latitude: parseFloat(req.query.lat),
        longitude: parseFloat(req.query.long),
    };
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
        return null;
    }
    return location;
}
app.get("/api/weather/", async (req, res, next) => {
    try {
        const location = parseLocation(req);
        if (!location) {
            writeClientError(res, "Missing location");
            return;
        }
        (0, metrics_1.notifyAPIRequest)("weather");
        res
            .setHeader("Cache-Control", "max-age=7200")
            .json(await (0, weather_1.getWeatherInfoByCoords)(location.latitude, location.longitude));
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/geocode/", async (req, res, next) => {
    try {
        if (!req.query.q) {
            writeClientError(res, "Missing query");
            return;
        }
        (0, metrics_1.notifyAPIRequest)("geocode");
        res
            .setHeader("Cache-Control", "max-age=604800")
            .json(await (0, geocode_1.getCoordsFromQuery)(req.query.q.trim()));
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/geolookup/", async (req, res, next) => {
    try {
        const location = parseLocation(req);
        if (!location) {
            writeClientError(res, "Missing location");
            return;
        }
        (0, metrics_1.notifyAPIRequest)("geolookup");
        res
            .setHeader("Cache-Control", "max-age=604800")
            .json(await (0, geocode_1.getLocationFromCoords)(location.latitude, location.longitude));
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/background/", async (_req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("background");
        res
            .setHeader("Cache-Control", "max-age=300")
            .json(await (0, backgrounds_1.getBackground)());
    }
    catch (e) {
        next(e);
    }
});
const backgroundVoteStream = fs_1.default.createWriteStream(path_1.default.resolve(config_1.SAVE_ROOT, "votes.csv"), { flags: "a" });
app.post("/api/background/vote/", async (req, res, next) => {
    var _a;
    try {
        (0, metrics_1.notifyAPIRequest)("vote");
        const background = req.body.background;
        const isPositive = req.body.is_positive;
        if ((background === null || background === void 0 ? void 0 : background.id) == undefined || isPositive === undefined) {
            writeClientError(res, "Missing background.id or is_positive");
            return;
        }
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const url = (_a = background.url) !== null && _a !== void 0 ? _a : "";
        const line = `${ip}, ${background.id}, ${isPositive ? 'good' : 'bad'}, ${url}\n`;
        backgroundVoteStream.write(line);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
const reCollectionID = /[\/\? ]/;
app.get("/api/unsplash/", async (req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("unsplash");
        const collection = req.query.collection;
        if (!collection) {
            writeClientError(res, "Missing collection ID");
            return;
        }
        if (reCollectionID.test(collection)) {
            writeClientError(res, "Invalid collection ID");
            return;
        }
        res
            .setHeader("Cache-Control", "max-age=300")
            .json(await (0, unsplash_1.default)(collection));
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/space-flights/", async (_req, res, next) => {
    var _a, _b;
    try {
        (0, metrics_1.notifyAPIRequest)("spaceflights");
        (0, metrics_1.notifyUpstreamRequest)("RocketLaunch.live");
        const ret = await (0, http_1.default)(new http_1.Request("https://fdo.rocketlaunch.live/json/launches/next/5", {
            method: "GET",
            size: 0.1 * 1000 * 1000,
            timeout: 10000,
            headers: {
                "User-Agent": config_1.UA_DEFAULT,
                "Accept": "application/json",
            },
        }));
        const json = await ret.json();
        // Stupid API keeps changing
        const result = (_b = (_a = json.response) === null || _a === void 0 ? void 0 : _a.result) !== null && _b !== void 0 ? _b : json.result;
        function mapProvider(provider) {
            if (provider.toLowerCase() == "united launch alliance (ula)") {
                return "United Launch Alliance";
            }
            else {
                return provider;
            }
        }
        const launches = result.map((launch) => {
            var _a, _b;
            return ({
                id: launch.id,
                name: launch.name,
                provider: mapProvider((_a = launch.provider) === null || _a === void 0 ? void 0 : _a.name),
                vehicle: (_b = launch.vehicle) === null || _b === void 0 ? void 0 : _b.name,
                win_open: launch.win_open,
                win_close: launch.win_close,
                date_str: launch.date_str,
                link: `https://rocketlaunch.live/launch/${launch.slug}`,
            });
        });
        res.setHeader("Cache-Control", "max-age=3600").json(launches);
    }
    catch (e) {
        next(e);
    }
});
const feedbackStream = fs_1.default.createWriteStream(path_1.default.resolve(config_1.SAVE_ROOT, "feedback.txt"), { flags: "a" });
app.post("/api/feedback/", async (req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("feedback");
        if (!req.body.event) {
            writeClientError(res, "Missing event");
            return;
        }
        feedbackStream.write(JSON.stringify(req.body) + "\n\n");
        if (config_1.DISCORD_WEBHOOK) {
            let comments = req.body.comments;
            const extraIds = ["missing_features", "difficult", "buggy"];
            for (const id of extraIds) {
                const value = req.body[`extra-${id}`];
                if (value && value != "") {
                    comments += `\n\n${id}:\n${value}`;
                }
            }
            const reasons = (typeof req.body.reason === "string") ? [req.body.reason] : req.body.reason;
            let content = `
				**Feedback**
				Event: ${req.body.event}
				Info: ${req.body.version ? "v" + req.body.version : ""} / ${req.body.browser} / ${req.body.platform}
				${reasons ? `Reasons: ${reasons.join(", ")}
						${req.body.other_reason}` : ""}
				${req.body.email ? `Email: ${req.body.email}` : ""}

				${comments}
			`;
            // Only allow at most two new lines in a row, ignoring whitespace
            content = content.replace(/\n\s*\n/g, "\n\n");
            (0, metrics_1.notifyUpstreamRequest)("Discord.com");
            await (0, http_1.default)(new http_1.Request(config_1.DISCORD_WEBHOOK, {
                method: "POST",
                timeout: 10000,
                headers: {
                    "User-Agent": config_1.UA_DEFAULT,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: content.replace(/\t/g, "").substr(0, 2000)
                }),
            }));
        }
        if (req.query.r) {
            res.redirect("https://renewedtab.com/feedback/thanks/");
        }
        else {
            res.json({ success: true });
        }
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/feeds/", async (_req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("autocomplete:feeds");
        res.setHeader("Cache-Control", "max-age=25200").json(data_1.autocompleteFeeds);
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/webcomics/", async (_req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("autocomplete:webcomic");
        res.setHeader("Cache-Control", "max-age=25200").json(data_1.autocompleteWebcomics);
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/feeds/background/", async (_req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("autocomplete:feeds_background");
        res.setHeader("Cache-Control", "max-age=25200").json(data_1.autocompleteBackgroundFeeds);
    }
    catch (e) {
        next(e);
    }
});
app.post("/api/autocomplete/", async (req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("autocomplete:suggest");
        if (!req.body.url) {
            writeClientError(res, "Missing URL");
            return;
        }
        if (!config_1.DISCORD_WEBHOOK) {
            writeClientError(res, "Server doesn't have suggestions enabled, missing DISCORD_WEBHOOK");
            return;
        }
        const content = `
			**URL Suggestion**
			Url: ${req.body.url}
		`;
        (0, metrics_1.notifyUpstreamRequest)("Discord.com");
        await (0, http_1.default)(new http_1.Request(config_1.DISCORD_WEBHOOK, {
            method: "POST",
            timeout: 10000,
            headers: {
                "User-Agent": config_1.UA_DEFAULT,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: content.replace(/\t/g, "").substr(0, 2000)
            }),
        }));
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/quote-categories/", async (req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("quote-categories");
        const quoteCategories = await (0, quotes_1.getQuoteCategories)();
        res.setHeader("Cache-Control", "max-age=3600").json(quoteCategories);
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/quotes/", async (req, res) => {
    try {
        (0, metrics_1.notifyAPIRequest)("quotes");
        let categories;
        const queryArg = req.query.categories;
        if (queryArg instanceof Array) {
            categories = queryArg;
        }
        else if (typeof queryArg == "string") {
            categories = [queryArg];
        }
        else {
            categories = ["inspire"];
        }
        const quoteCategories = await (0, quotes_1.getQuoteCategories)();
        // filter out unknown categories
        categories = categories.filter(x => quoteCategories.find(y => y.id == x));
        if (categories.length == 0) {
            categories.push("inspire");
        }
        const category = categories[Math.floor(Math.random() * categories.length)];
        const quotes = await (0, quotes_1.getQuote)(category);
        quotes.forEach(quote => {
            quote.category = category;
        });
        if (quotes.length == 0) {
            res.removeHeader("expires");
            res.append("max-age", "0");
        }
        res.setHeader("Cache-Control", "max-age=300").json(quotes);
    }
    catch (e) {
        // next(e);
        res.removeHeader("expires");
        res.append("max-age", "0");
        res.json([]);
    }
});
app.get("/api/currencies/", async (req, res, next) => {
    try {
        (0, metrics_1.notifyAPIRequest)("currency");
        res.setHeader("Cache-Control", "max-age=10800").json(await (0, currencies_1.getCurrencies)());
    }
    catch (e) {
        next(e);
    }
});
const TIPPY_TOP_URL = "https://mozilla.github.io/tippy-top-sites/data/icons-top2000.json";
let icons = undefined;
app.get("/api/website-icons/", async (req, res, next) => {
    try {
        if (!icons) {
            (0, metrics_1.notifyUpstreamRequest)(new URL(TIPPY_TOP_URL).hostname);
            const response = await (0, http_1.default)(new http_1.Request(TIPPY_TOP_URL), {
                method: "GET",
                timeout: 10000,
                headers: {
                    "User-Agent": config_1.UA_DEFAULT,
                    "Accept": "application/json",
                },
            });
            icons = (await response.json());
            icons.push({
                domains: ["minetest.net", "wiki.minetest.net", "forum.minetest.net"],
                image_url: "https://www.minetest.net/media/icon.svg",
            }, {
                domains: ["feeds.bbci.co.uk"],
                image_url: "https://m.files.bbci.co.uk/modules/bbc-morph-news-waf-page-meta/5.2.0/apple-touch-icon.png",
            });
            icons.find(x => x.domains.includes("github.com")).image_url =
                "https://github.githubassets.com/favicons/favicon-dark.svg";
        }
        res.setHeader("Cache-Control", "max-age=25200").json(icons);
    }
    catch (e) {
        next(e);
    }
});
app.get("/api/detect-feed/", async (req, res, next) => {
    try {
        if (typeof req.query.url != "string") {
            writeClientError(res, "Missing URL");
            return;
        }
        (0, metrics_1.notifyAPIRequest)("detect-feed");
        const feeds = await (0, detect_1.detectFeed)(req.query.url, async (url) => {
            var _a;
            (0, metrics_1.notifyUpstreamRequest)("proxy");
            const response = await (0, http_1.default)(url, {
                method: "GET",
                size: 5 * 1000 * 1000,
                timeout: 10000,
                headers: {
                    "User-Agent": config_1.UA_PROXY,
                    "Accept": "text/html, application/json, application/xml, text/xml, application/rss+xml, application/atom+xml",
                },
            });
            if (!response.ok) {
                throw new UserError_1.default("Error fetching " + url + ": " + response.status);
            }
            const text = await response.text();
            const isHTML = (_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.startsWith("text/html");
            console.log(response.headers.get("content-type"));
            console.log(url, isHTML ? "html" : "xml");
            const document = new jsdom_1.JSDOM(text, { contentType: isHTML ? "text/html" : "application/xml" });
            console.log("Fetching ", url, document.window.document.children[0]);
            return document.window.document.children[0];
        });
        res.json(feeds.map(feed => {
            var _a;
            return ({
                type: (_a = feeds_1.FeedType[feed.type]) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                title: feed.title,
                url: feed.url,
                number_of_articles: feed.numberOfArticles,
                number_of_images: feed.numberOfImages,
            });
        }));
    }
    catch (e) {
        next(e);
    }
});
app.use(Sentry.Handlers.errorHandler());
app.use(function (err, _req, res, next) {
    console.error(err.stack);
    res.removeHeader("expires");
    res.append("max-age", "0");
    if (err instanceof UserError_1.default) {
        writeClientError(res, err.message);
    }
    else {
        res.status(400).type("text").send("Unexpected error");
    }
    next();
});
app.listen(config_1.PORT, () => {
    console.log(`⚡️[server]: Server is running in ${config_1.IS_DEBUG ? "debug" : "prod"} at http://localhost:${config_1.PORT}`);
});
//# sourceMappingURL=index.js.map