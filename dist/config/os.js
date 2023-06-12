"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../logging"));
const log = new logging_1.default('Servers');
class OperatingSystem {
    constructor() {
        this.Name = "";
        this.Image = "";
        this.OS = "";
        this.Distribution = "";
        this.Version = "";
        this.Dependencies = {};
        this.Groups = [];
        this.Users = [];
    }
    static Init() {
        let tmp = new OperatingSystem();
    }
}
exports.default = OperatingSystem;
//# sourceMappingURL=os.js.map