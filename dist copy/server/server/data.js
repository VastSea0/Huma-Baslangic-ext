"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autocompleteBackgroundFeeds = exports.autocompleteWebcomics = exports.autocompleteFeeds = void 0;
const fs_1 = __importDefault(require("fs"));
function readAutocompleteFromFile(filename) {
    return fs_1.default.readFileSync(`src/server/data/${filename}.csv`)
        .toString()
        .split(/\r?\n/)
        .map(x => x.split(","))
        .filter(x => x.length == 2)
        .map(([label, value]) => ({ label: label.trim(), value: value.trim() }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}
exports.autocompleteFeeds = readAutocompleteFromFile("feeds");
exports.autocompleteWebcomics = readAutocompleteFromFile("webcomics");
exports.autocompleteBackgroundFeeds = readAutocompleteFromFile("feeds_background");
//# sourceMappingURL=data.js.map