"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
function ParseArgs() {
    let args = yargs_1.default.argv;
    return args;
}
exports.default = ParseArgs;
//# sourceMappingURL=args.js.map