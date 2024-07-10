"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationFromCoords = exports.getCoordsFromQuery = void 0;
const http_1 = require("../http");
const metrics_1 = require("../metrics");
const cache_1 = require("../cache");
const accu_1 = require("./accu");
const UserError_1 = __importDefault(require("server/UserError"));
const config_1 = require("server/config");
function getLocationName(loc) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const parts = [
        (_b = (_a = loc.LocalisedName) !== null && _a !== void 0 ? _a : loc.EnglishName) !== null && _b !== void 0 ? _b : "?",
        (_d = (_c = loc.AdministrativeArea) === null || _c === void 0 ? void 0 : _c.LocalizedName) !== null && _d !== void 0 ? _d : (_e = loc.AdministrativeArea) === null || _e === void 0 ? void 0 : _e.EnglishName,
        (_g = (_f = loc.Country) === null || _f === void 0 ? void 0 : _f.LocalizedName) !== null && _g !== void 0 ? _g : (_h = loc.Country) === null || _h === void 0 ? void 0 : _h.EnglishName,
    ];
    return parts.filter(x => x).join(", ");
}
async function fetchLocationsFromQuery(query) {
    if (!config_1.ACCUWEATHER_API_KEY) {
        throw new UserError_1.default("Weather API disabled as the server owner hasn't configured ACCUWEATHER_API_KEY.");
    }
    const url = new URL("http://dataservice.accuweather.com/locations/v1/search");
    url.searchParams.set("q", query);
    url.searchParams.set("apikey", config_1.ACCUWEATHER_API_KEY);
    (0, metrics_1.notifyUpstreamRequest)("AccuWeather.com");
    const response = await (0, http_1.fetchRetry)(new http_1.Request(url, {
        method: "GET",
        headers: {
            "User-Agent": config_1.UA_DEFAULT,
            "Accept": "application/json",
        }
    }));
    if (!response.ok) {
        await (0, accu_1.handleAccuError)(response);
    }
    const json = await response.json();
    return json.slice(0, 5).map(loc => ({
        key: loc.Key,
        name: getLocationName(loc),
        latitude: loc.GeoPosition.Latitude,
        longitude: loc.GeoPosition.Longitude
    }));
}
async function fetchLocationsFromCoord(lat, long) {
    if (!config_1.ACCUWEATHER_API_KEY) {
        throw new UserError_1.default("Weather API disabled as the server owner hasn't configured ACCUWEATHER_API_KEY.");
    }
    const url = new URL("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search");
    url.searchParams.set("q", `${lat},${long}`);
    url.searchParams.set("apikey", config_1.ACCUWEATHER_API_KEY);
    (0, metrics_1.notifyUpstreamRequest)("AccuWeather.com");
    const response = await (0, http_1.fetchRetry)(new http_1.Request(url, {
        method: "GET",
        headers: {
            "User-Agent": config_1.UA_DEFAULT,
            "Accept": "application/json",
        }
    }));
    if (!response.ok) {
        await (0, accu_1.handleAccuError)(response);
    }
    const json = await response.json();
    return [
        {
            key: json.Key,
            name: getLocationName(json),
            latitude: json.GeoPosition.Latitude,
            longitude: json.GeoPosition.Longitude,
        }
    ];
}
exports.getCoordsFromQuery = (0, cache_1.makeKeyCache)(fetchLocationsFromQuery, 0);
exports.getLocationFromCoords = (0, cache_1.makeKeyCache)(fetchLocationsFromCoord, 0, (lat, long) => `${lat.toFixed(2)},${long.toFixed(2)}`);
//# sourceMappingURL=geocode.js.map