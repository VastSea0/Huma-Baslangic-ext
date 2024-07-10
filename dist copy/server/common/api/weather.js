"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpeedUnitSuffix = exports.convertSpeed = exports.getUVRisk = exports.UVRisk = exports.convertWeatherTemperatures = exports.SpeedUnit = exports.TemperatureUnit = void 0;
const enum_1 = require("app/utils/enum");
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit[TemperatureUnit["Celsius"] = 0] = "Celsius";
    TemperatureUnit[TemperatureUnit["Fahrenheit"] = 1] = "Fahrenheit"; // :'(
})(TemperatureUnit = exports.TemperatureUnit || (exports.TemperatureUnit = {}));
var SpeedUnit;
(function (SpeedUnit) {
    SpeedUnit[SpeedUnit["MetersPerSecond"] = 0] = "MetersPerSecond";
    SpeedUnit[SpeedUnit["MilesPerHour"] = 1] = "MilesPerHour";
    SpeedUnit[SpeedUnit["KilometersPerHour"] = 2] = "KilometersPerHour";
})(SpeedUnit = exports.SpeedUnit || (exports.SpeedUnit = {}));
function convertWeatherTemperatures(info, unit) {
    unit = (0, enum_1.enumToValue)(TemperatureUnit, unit);
    function convert(temp) {
        if (temp == undefined) {
            return undefined;
        }
        else if (unit == TemperatureUnit.Fahrenheit) {
            return 1.8 * temp + 32;
        }
        else {
            return temp;
        }
    }
    return {
        ...info,
        current: {
            ...info.current,
            temp: convert(info.current.temp),
            feels_like: convert(info.current.feels_like),
        },
        hourly: info.hourly.map(hour => ({
            ...hour,
            temp: convert(hour.temp),
        })),
        daily: info.daily.map(day => ({
            ...day,
            minTemp: convert(day.minTemp),
            maxTemp: convert(day.maxTemp),
        })),
    };
}
exports.convertWeatherTemperatures = convertWeatherTemperatures;
var UVRisk;
(function (UVRisk) {
    UVRisk[UVRisk["Low"] = 0] = "Low";
    UVRisk[UVRisk["Moderate"] = 1] = "Moderate";
    UVRisk[UVRisk["High"] = 2] = "High";
    UVRisk[UVRisk["VeryHigh"] = 3] = "VeryHigh";
    UVRisk[UVRisk["Extreme"] = 4] = "Extreme";
})(UVRisk = exports.UVRisk || (exports.UVRisk = {}));
function getUVRisk(uvi) {
    if (uvi < 3) {
        return UVRisk.Low;
    }
    else if (uvi < 6) {
        return UVRisk.Moderate;
    }
    else if (uvi < 8) {
        return UVRisk.High;
    }
    else if (uvi < 11) {
        return UVRisk.VeryHigh;
    }
    else {
        return UVRisk.Extreme;
    }
}
exports.getUVRisk = getUVRisk;
function convertSpeed(speed, unit) {
    unit = (0, enum_1.enumToValue)(SpeedUnit, unit);
    switch (unit) {
        case SpeedUnit.MetersPerSecond:
            return speed;
        case SpeedUnit.MilesPerHour:
            return speed * 2.23694;
        case SpeedUnit.KilometersPerHour:
            return speed * 3.6;
        default:
            throw new Error(`Unknown unit: ${unit}`);
    }
}
exports.convertSpeed = convertSpeed;
const SpeedUnitSuffixes = {
    [SpeedUnit.MetersPerSecond]: "m/s",
    [SpeedUnit.MilesPerHour]: "mph",
    [SpeedUnit.KilometersPerHour]: "kph",
};
function getSpeedUnitSuffix(unit) {
    if (typeof unit == "string") {
        unit = SpeedUnit[unit];
    }
    return SpeedUnitSuffixes[unit];
}
exports.getSpeedUnitSuffix = getSpeedUnitSuffix;
//# sourceMappingURL=weather.js.map