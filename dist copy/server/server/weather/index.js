"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherInfoByCoords = exports.getWeatherInfo = void 0;
const http_1 = require("../http");
const metrics_1 = require("../metrics");
const cache_1 = require("../cache");
const geocode_1 = require("./geocode");
const accu_1 = require("./accu");
const UserError_1 = __importDefault(require("server/UserError"));
const config_1 = require("server/config");
const ACCU_ICONS_TO_OWM = {
    "sunny": "01d",
    "mostly sunny": "01d",
    "partly sunny": "01d",
    "intermittent clouds": "02d",
    "hazy sunshine": "01d",
    "mostly cloudy": "03d",
    "cloudy": "03d",
    "dreary (overcast)": "03d",
    "fog": "50d",
    "showers": "09d",
    "mostly cloudy w/ showers": "09d",
    "partly sunny w/ showers": "09d",
    "t-storms": "11d",
    "mostly cloudy w/ t-storms": "11d",
    "partly sunny w/ t-storms": "11d",
    "rain": "09d",
    "flurries": "09d",
    "mostly cloudy w/ flurries": "09d",
    "partly sunny w/ flurries": "09d",
    "snow": "13d",
    "mostly cloudy w/ snow": "13d",
    "ice": "13d",
    "sleet": "13d",
    "freezing rain": "09d",
    "rain and snow": "13d",
    "hot": "",
    "cold": "",
    "windy": "",
    "clear": "01n",
    "mostly clear": "01n",
    "partly cloudy": "02n",
    "intermittent clouds 2": "02n",
    "hazy moonlight": "02n",
    "mostly cloudy 2": "03n",
    "partly cloudy w/ showers": "09n",
    "mostly cloudy w/ showers 2": "09n",
    "partly cloudy w/ t-storms": "11n",
    "mostly cloudy w/ t-storms 2": "11n",
    "mostly cloudy w/ flurries 2": "13n",
    "mostly cloudy w/ snow ": "13n",
};
function getLegacyIcon(icon, phrase) {
    var _a, _b;
    return (_b = ACCU_ICONS_TO_OWM[(_a = phrase === null || phrase === void 0 ? void 0 : phrase.toLowerCase()) !== null && _a !== void 0 ? _a : ""]) !== null && _b !== void 0 ? _b : Object.values(ACCU_ICONS_TO_OWM)[icon];
}
function indexOfOrUndefined(str, searchString, position) {
    const idx = str.indexOf(searchString, position);
    return idx == -1 ? undefined : idx;
}
/**
 * @param date A date like "2021-10-23T07:00:00+09:00"
 * @returns
 */
function dateToLocaltime(date) {
    var _a;
    const tIdx = date.indexOf("T");
    const zoneIdx = (_a = indexOfOrUndefined(date, "+", tIdx)) !== null && _a !== void 0 ? _a : indexOfOrUndefined(date, "-", tIdx);
    const time = date.substring(tIdx + 1, zoneIdx).split(":");
    return `${time[0]}:${time[1]}`;
}
/**
 * @param date A date like "2021-10-23T07:00:00+09:00"
 * @returns
 */
function dateToDayOfWeek(date) {
    const dateOnly = date.substring(0, date.indexOf("T"));
    return new Date(dateOnly).getUTCDay();
}
async function fetchCurrentForecast(key) {
    if (!config_1.ACCUWEATHER_API_KEY) {
        throw new UserError_1.default("Weather API disabled as the server owner hasn't configured ACCUWEATHER_API_KEY.");
    }
    (0, metrics_1.notifyUpstreamRequest)("AccuWeather.com");
    const url = new URL(`http://dataservice.accuweather.com/currentconditions/v1/${key}`);
    url.searchParams.set("apikey", config_1.ACCUWEATHER_API_KEY);
    url.searchParams.set("details", "true");
    url.searchParams.set("metric", "true");
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
    const array = await response.json();
    return array[0];
}
async function fetchHourlyForecast(key) {
    if (!config_1.ACCUWEATHER_API_KEY) {
        throw new UserError_1.default("Weather API disabled as the server owner hasn't configured ACCUWEATHER_API_KEY.");
    }
    (0, metrics_1.notifyUpstreamRequest)("AccuWeather.com");
    const url = new URL(`http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${key}`);
    url.searchParams.set("apikey", config_1.ACCUWEATHER_API_KEY);
    url.searchParams.set("metric", "true");
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
    return json.map(hour => {
        var _a;
        return ({
            time: dateToLocaltime(hour.DateTime),
            temp: (_a = hour.Temperature.Value) !== null && _a !== void 0 ? _a : undefined,
            icon: getLegacyIcon(hour.WeatherIcon, hour.IconPhrase),
            precipitation: hour.PrecipitationProbability,
        });
    });
}
async function fetchDailyForecast(key) {
    if (!config_1.ACCUWEATHER_API_KEY) {
        throw new UserError_1.default("Weather API disabled as the server owner hasn't configured ACCUWEATHER_API_KEY.");
    }
    (0, metrics_1.notifyUpstreamRequest)("AccuWeather.com");
    const url = new URL(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${key}`);
    url.searchParams.set("apikey", config_1.ACCUWEATHER_API_KEY);
    url.searchParams.set("details", "true");
    url.searchParams.set("metric", "true");
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
    return json.DailyForecasts.map(day => {
        var _a, _b;
        return ({
            dayOfWeek: dateToDayOfWeek(day.Date),
            icon: getLegacyIcon(day.Day.Icon, day.Day.IconPhrase),
            minTemp: (_a = day.Temperature.Minimum.Value) !== null && _a !== void 0 ? _a : undefined,
            maxTemp: (_b = day.Temperature.Maximum.Value) !== null && _b !== void 0 ? _b : undefined,
            sunrise: day.Sun.Rise ? dateToLocaltime(day.Sun.Rise) : undefined,
            sunset: day.Sun.Set ? dateToLocaltime(day.Sun.Set) : undefined,
            precipitation: day.Day.PrecipitationProbability,
            wind_speed: day.Day.Wind.Speed.Value != null
                ? Math.round(100 * day.Day.Wind.Speed.Value / 3.6) / 100
                : undefined,
        });
    });
}
async function fetchWeatherInfo(key) {
    var _a, _b, _c, _d, _e, _f;
    const [current, hourly, daily] = await Promise.all([
        fetchCurrentForecast(key),
        fetchHourlyForecast(key),
        fetchDailyForecast(key),
    ]);
    const estimatedPercipitation = hourly.slice(0, 4)
        .reduce((acc, x) => { var _a; return Math.max(acc, (_a = x.precipitation) !== null && _a !== void 0 ? _a : 0); }, 0);
    return {
        current: {
            icon: getLegacyIcon(current.WeatherIcon, undefined),
            temp: (_a = current.Temperature.Metric.Value) !== null && _a !== void 0 ? _a : undefined,
            feels_like: (_b = current.RealFeelTemperature.Metric.Value) !== null && _b !== void 0 ? _b : undefined,
            pressure: (_c = current.Pressure.Metric.Value) !== null && _c !== void 0 ? _c : undefined,
            humidity: current.RelativeHumidity,
            sunrise: (_d = daily[0]) === null || _d === void 0 ? void 0 : _d.sunrise,
            sunset: (_e = daily[0]) === null || _e === void 0 ? void 0 : _e.sunset,
            uvi: current.UVIndex,
            precipitation: (_f = current.PrecipitationProbability) !== null && _f !== void 0 ? _f : estimatedPercipitation,
            wind_speed: current.Wind.Speed.Metric.Value != null
                ? Math.round(100 * current.Wind.Speed.Metric.Value / 3.6) / 100
                : undefined,
        },
        hourly,
        daily,
        url: current.Link.replace("http://", "https://"),
    };
}
exports.getWeatherInfo = (0, cache_1.makeKeyCache)(fetchWeatherInfo, 2 * 60);
async function fetchWeatherInfoByCoords(lat, long) {
    const location = await (0, geocode_1.getLocationFromCoords)(lat, long);
    return await (0, exports.getWeatherInfo)(location[0].key);
}
exports.getWeatherInfoByCoords = (0, cache_1.makeKeyCache)(fetchWeatherInfoByCoords, 1 * 60, (lat, long) => `${lat.toFixed(2)},${long.toFixed(2)}`);
//# sourceMappingURL=index.js.map