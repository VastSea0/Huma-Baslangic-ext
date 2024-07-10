"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserError";
    }
}
exports.default = UserError;
//# sourceMappingURL=UserError.js.map