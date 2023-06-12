"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfig = exports.LocalConfig = void 0;
const localConfig_1 = __importDefault(require("./localConfig"));
exports.LocalConfig = localConfig_1.default;
const project_1 = __importDefault(require("./project"));
exports.ProjectConfig = project_1.default;
const logging_1 = __importDefault(require("../logging"));
let log = new logging_1.default("Config loading");
//# sourceMappingURL=index.js.map