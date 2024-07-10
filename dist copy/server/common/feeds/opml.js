"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOPML = exports.parseOPML = void 0;
const uuid_1 = __importDefault(require("../../app/utils/uuid"));
function parseOPML(data, parseXML) {
    const root = parseXML(data, "application/xml");
    return Array.from(root.querySelectorAll("outline[type='rss'][xmlUrl]")).map(x => {
        var _a, _b, _c;
        return ({
            id: (0, uuid_1.default)(),
            title: (_b = (_a = x.getAttribute("title")) !== null && _a !== void 0 ? _a : x.getAttribute("text")) !== null && _b !== void 0 ? _b : "",
            url: x.getAttribute("xmlUrl"),
            htmlUrl: (_c = x.getAttribute("htmlUrl")) !== null && _c !== void 0 ? _c : undefined,
        });
    });
}
exports.parseOPML = parseOPML;
function quoteattr(s) {
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, '\n') /* Must be before the next replacement. */
        .replace(/[\r\n]/g, '\n');
}
function makeOPML(sources) {
    // This is hacky, but I want to avoid needing an XML writer
    const inner = sources.map(x => {
        var _a;
        return `<outline type="rss"
			text="${quoteattr(x.title)}"
			title="${quoteattr(x.title)}"
			xmlUrl="${quoteattr(x.url)}"
			htmlUrl="${quoteattr((_a = x.htmlUrl) !== null && _a !== void 0 ? _a : '')}" />`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>
		<opml version="1.0">
			<head>
				<title>Renewed Tab feed export</title>
			</head>
			<body>
				<outline text="Feeds" title="Feeds">
					${inner.join("\n")}
				</outline>
			</body>
		</opml>
	`;
}
exports.makeOPML = makeOPML;
//# sourceMappingURL=opml.js.map