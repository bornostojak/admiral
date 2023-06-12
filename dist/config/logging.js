"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingLevelEnum = exports.LoggingDepthEnum = void 0;
const fs_1 = require("fs");
const path_1 = require("../helper/path");
var LoggingDepthEnum;
(function (LoggingDepthEnum) {
    LoggingDepthEnum[LoggingDepthEnum["full"] = 2] = "full";
    LoggingDepthEnum[LoggingDepthEnum["inner"] = 1] = "inner";
    LoggingDepthEnum[LoggingDepthEnum["off"] = 0] = "off";
})(LoggingDepthEnum = exports.LoggingDepthEnum || (exports.LoggingDepthEnum = {}));
// enum LoggingLevelEnum {
// trace                   = 31,  // 00011111
// info                    = 15,  // 00001111
// warning                 = 7,   // 00000111
// debug                   = 3,   // 00000011
// log                     = 1,   // 00000001
// error                   = 0,   // 00000000
// off                     = -1   // 11111111
// }
var LoggingLevelEnum;
(function (LoggingLevelEnum) {
    LoggingLevelEnum[LoggingLevelEnum["trace"] = 4] = "trace";
    LoggingLevelEnum[LoggingLevelEnum["info"] = 3] = "info";
    LoggingLevelEnum[LoggingLevelEnum["warning"] = 3] = "warning";
    LoggingLevelEnum[LoggingLevelEnum["debug"] = 1] = "debug";
    LoggingLevelEnum[LoggingLevelEnum["error"] = 0] = "error";
})(LoggingLevelEnum = exports.LoggingLevelEnum || (exports.LoggingLevelEnum = {}));
class LoggingConfig {
    constructor(args1) {
        var _a, _b;
        this.Level = LoggingLevelEnum.error;
        this.Depth = LoggingDepthEnum.off;
        if (!args1)
            return this;
        this.Level = (_a = Object.entries(LoggingLevelEnum).filter(([key, val]) => { var _a; return (_a = val === args1.Level) !== null && _a !== void 0 ? _a : 'error'; }).map(([k, v]) => v)[0]) !== null && _a !== void 0 ? _a : LoggingLevelEnum.error;
        this.Depth = (_b = Object.entries(LoggingDepthEnum).filter(([key, val]) => { var _a; return (_a = val === args1.Depth) !== null && _a !== void 0 ? _a : 'off'; }).map(([k, v]) => v)[0]) !== null && _b !== void 0 ? _b : LoggingDepthEnum.off;
        return this;
    }
    toObject() {
        var _a, _b;
        return {
            Level: (_a = Object.entries(LoggingLevelEnum).filter(([k, v]) => v === this.Level)[0][0]) !== null && _a !== void 0 ? _a : 'error',
            Depth: (_b = Object.entries(LoggingDepthEnum).filter(([k, v]) => v === this.Depth)[0][0]) !== null && _b !== void 0 ? _b : 'off'
        };
    }
    toJSON(indent) {
        try {
            return indent ? JSON.stringify(this.toObject(), null, indent) : JSON.stringify(this.toObject());
        }
        catch (_a) {
            let obj = { Level: 'error', Depth: 'off' };
            return indent ? JSON.stringify(obj, null, indent) : JSON.stringify(obj);
        }
    }
    static fromJSON(jsonData) {
        var _a, _b, _c, _d;
        try {
            let localConfigObj = JSON.parse(jsonData);
            let tmp = new LoggingConfig();
            // tmp.Level = Object.entries(LoggingLevelEnum).filter(([k,v]) => (k === (localConfigObj['Level'].toString() as string).toLowerCase())).map(([k,v]) => v as LoggingLevelEnum)[0] ?? LoggingLevelEnum.error
            // tmp.Depth = Object.entries(LoggingDepthEnum).filter(([k,v]) => (k === (localConfigObj['Depth'].toString() as string).toLowerCase())).map(([k,v]) => v as LoggingDepthEnum)[0] ?? LoggingDepthEnum.off
            switch ((_b = (_a = localConfigObj === null || localConfigObj === void 0 ? void 0 : localConfigObj.Logging) === null || _a === void 0 ? void 0 : _a.Level) !== null && _b !== void 0 ? _b : 'error') {
                case "1":
                case "error":
                    tmp.Level = LoggingLevelEnum.error;
                    break;
                case "2":
                case "debug":
                    tmp.Level = LoggingLevelEnum.debug;
                    break;
                case "3":
                case "warning":
                    tmp.Level = LoggingLevelEnum.warning;
                    break;
                case "4":
                case "info":
                    tmp.Level = LoggingLevelEnum.info;
                    break;
                case "5":
                case "trace":
                    tmp.Level = LoggingLevelEnum.trace;
                    break;
                default:
                    tmp.Level = LoggingLevelEnum.error;
            }
            switch ((_d = (_c = localConfigObj === null || localConfigObj === void 0 ? void 0 : localConfigObj.Logging) === null || _c === void 0 ? void 0 : _c.Depth) !== null && _d !== void 0 ? _d : 'off') {
                case "0":
                case "off":
                    tmp.Depth = LoggingDepthEnum.off;
                    break;
                case "1":
                case "inner":
                    tmp.Depth = LoggingDepthEnum.inner;
                    break;
                case "2":
                case "full":
                    tmp.Depth = LoggingDepthEnum.full;
                    break;
                default:
                    tmp.Depth = LoggingDepthEnum.off;
                    break;
            }
            return tmp;
        }
        catch (_e) {
            return new LoggingConfig();
        }
    }
    static Load() {
        let path = [".admiral", "~/.admiral", "~/.config/admiral/"]
            .map(f => (0, path_1.ResolveUri)(f))
            .filter(x => (0, fs_1.existsSync)(x))[0];
        if (!(0, fs_1.existsSync)(path) || !(0, fs_1.existsSync)(`${path}/config.json`)) {
            return new LoggingConfig();
        }
        try {
            let localConfig = this.fromJSON((0, fs_1.readFileSync)(`${path}/config.json`).toString());
            return localConfig;
            //return Object.assign(new LoggingConfig(), {...localConfig['Logging']})
        }
        catch (_a) {
            return Object.assign(new LoggingConfig(), { Level: 1, Depth: 0 });
        }
    }
}
exports.default = LoggingConfig;
//# sourceMappingURL=logging.js.map