"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDays = exports.parseDate = exports.calculateDecimalAge = exports.calculateLastAndNextBirthday = exports.isMidnight = exports.setMidnight = exports.setEndOfDay = exports.toYear = exports.ONE_WEEK_MS = exports.ONE_DAY_MS = exports.ONE_HOUR_MS = void 0;
exports.ONE_HOUR_MS = 60 * 60 * 1000;
exports.ONE_DAY_MS = 24 * exports.ONE_HOUR_MS;
exports.ONE_WEEK_MS = 7 * exports.ONE_DAY_MS;
function toYear(date, year) {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    return newDate;
}
exports.toYear = toYear;
function setEndOfDay(date) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    return date;
}
exports.setEndOfDay = setEndOfDay;
function setMidnight(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}
exports.setMidnight = setMidnight;
function isMidnight(date) {
    return date.getHours() == 0 && date.getMinutes() == 0 &&
        date.getSeconds() == 0;
}
exports.isMidnight = isMidnight;
/**
 * Returns the dates of their last birthday and their next birthday
 *
 * @param dateOfBirth
 * @returns [lastBirthday, nextBirthday]
 */
function calculateLastAndNextBirthday(now, dateOfBirth) {
    const thisYear = toYear(dateOfBirth, now.getFullYear());
    setMidnight(thisYear);
    if (thisYear.getTime() <= now.getTime()) {
        // Birthday has passed this year
        const nextYear = toYear(dateOfBirth, now.getFullYear() + 1);
        setMidnight(nextYear);
        return [thisYear, nextYear];
    }
    else {
        // Birthday is still to come
        const lastYear = toYear(dateOfBirth, now.getFullYear() - 1);
        setMidnight(lastYear);
        return [lastYear, thisYear];
    }
}
exports.calculateLastAndNextBirthday = calculateLastAndNextBirthday;
function calculateDecimalAge(dateOfBirth) {
    const now = new Date();
    const [lastBirthday, nextBirthday] = calculateLastAndNextBirthday(now, dateOfBirth);
    // Calculate integer age
    const delta = lastBirthday.getTime() - dateOfBirth.getTime();
    const integerPart = Math.round(delta / 365.25 / 1000 / (60 * 60 * 24));
    // Calculate fraction of `now` between lastBirthday and nextBirthday
    const fractionalPart = (now.getTime() - lastBirthday.getTime())
        /
            (nextBirthday.getTime() - lastBirthday.getTime());
    return integerPart + fractionalPart;
}
exports.calculateDecimalAge = calculateDecimalAge;
function parseDate(v) {
    if (v == undefined) {
        return undefined;
    }
    const ret = new Date(v);
    return !isNaN(ret.getTime()) ? ret : undefined;
}
exports.parseDate = parseDate;
function addDays(date, days) {
    return new Date(date.getTime() + days * exports.ONE_DAY_MS);
}
exports.addDays = addDays;
//# sourceMappingURL=dates.js.map