"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveUri = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
function ResolveUri(uri) {
    return path_1.default.resolve(uri.replace(/^~\//, os_1.default.homedir() + '/')
        .replace(/^~([a-z])/, "/home/$1")
        .replace(/^~$/, os_1.default.homedir()));
}
exports.ResolveUri = ResolveUri;
//# sourceMappingURL=path.js.map