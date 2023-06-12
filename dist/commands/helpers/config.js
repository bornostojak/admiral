"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrInitLocalConfigDirectoryWithDefaults = void 0;
const fs_1 = require("fs");
const localConfig_1 = __importDefault(require("../../config/localConfig"));
const path_1 = require("../../helper/path");
function validateOrInitLocalConfigDirectoryWithDefaults() {
    let directories = ['.admiral', '~/.admiral', '~/.config/admiral'].map(d => (0, path_1.ResolveUri)(d));
    let existingLocations = directories.filter(d => (0, fs_1.existsSync)(d));
    if (existingLocations.length < 1) {
        localConfig_1.default.InitLocalConfig();
    }
}
exports.validateOrInitLocalConfigDirectoryWithDefaults = validateOrInitLocalConfigDirectoryWithDefaults;
//# sourceMappingURL=config.js.map