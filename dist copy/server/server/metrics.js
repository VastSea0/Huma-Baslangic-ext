"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUpstreamRetry = exports.notifyUpstreamRequest = exports.notifyAPIRequest = exports.promRegister = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const collectDefaultMetrics = prom_client_1.default.collectDefaultMetrics;
exports.promRegister = prom_client_1.default.register;
collectDefaultMetrics();
new prom_client_1.default.Gauge({
    name: "nodejs_uptime",
    help: "uptime in seconds",
    collect() {
        this.set(process.uptime());
    },
});
const requestsCounter = new prom_client_1.default.Counter({
    name: "renewedtab_requests",
    help: "renewedtab_requests",
    labelNames: ["endpoint"],
});
function notifyAPIRequest(endpoint) {
    requestsCounter.labels({ endpoint }).inc();
}
exports.notifyAPIRequest = notifyAPIRequest;
const upstreamCounter = new prom_client_1.default.Counter({
    name: "renewedtab_upstream_requests",
    help: "renewedtab_upstream_requests",
    labelNames: ["upstream"],
});
function notifyUpstreamRequest(upstream) {
    upstreamCounter.labels({ upstream }).inc();
}
exports.notifyUpstreamRequest = notifyUpstreamRequest;
const upstreamRetriesCounter = new prom_client_1.default.Counter({
    name: "renewedtab_upstream_retries",
    help: "renewedtab_upstream_retries",
    labelNames: ["upstream"],
});
function notifyUpstreamRetry(upstream) {
    upstreamRetriesCounter.labels({ upstream }).inc();
}
exports.notifyUpstreamRetry = notifyUpstreamRetry;
//# sourceMappingURL=metrics.js.map