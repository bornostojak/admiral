"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
const process_1 = require("process");
const fs_1 = require("fs");
const logging_1 = __importDefault(require("../logging"));
const path_1 = require("../helper/path");
let log = new logging_1.default("Config(Status)");
class Status {
    constructor() {
        this.Active = [];
        this.Confirmation = { Prompted: false, State: false };
    }
    /**
     *
     * @returns return a JSON of the object
     */
    toJSON() {
        var _a, _b;
        let json = {
            Active: this.Active,
            Confirmation: {
                Prompted: (_a = this.Confirmation) === null || _a === void 0 ? void 0 : _a.Prompted,
                State: (_b = this.Confirmation) === null || _b === void 0 ? void 0 : _b.State
            }
        };
        return json;
    }
    /**
     *
     * @param jsonData the status information string in json format
     * @returns the Status object
     */
    fromJSON(jsonData) {
        var _a, _b, _c, _d;
        try {
            log.Debug("Converting Status from json string");
            let jsonParsed = JSON.parse(jsonData);
            log.Trace(JSON.stringify(jsonParsed));
            this.Active = jsonParsed['Active'] instanceof (Array) ? jsonParsed['Active'] : [];
            this.Confirmation = {
                Prompted: (_b = (_a = jsonParsed === null || jsonParsed === void 0 ? void 0 : jsonParsed.Confirmation) === null || _a === void 0 ? void 0 : _a.Prompted) !== null && _b !== void 0 ? _b : false,
                State: (_d = (_c = jsonParsed === null || jsonParsed === void 0 ? void 0 : jsonParsed.Confirmation) === null || _c === void 0 ? void 0 : _c.State) !== null && _d !== void 0 ? _d : false
            };
            return this;
        }
        catch (err) {
            log.Error('Failed to parse json data');
            log.Error("ERROR:");
            log.Error(err);
            log.Error("JSON:");
            log.Error({ jsonData });
            (0, process_1.exit)(1);
        }
    }
    /**
     *
     * @param jsonData the status information string in json format
     * @returns the Status object
     */
    static fromJSON(jsonData) {
        var _a, _b, _c, _d;
        try {
            log.Debug("Converting Status from json string");
            let jsonParsed = JSON.parse(jsonData);
            log.Trace(JSON.stringify(jsonParsed));
            let tmp = new Status();
            tmp.Active = jsonParsed['Active'] instanceof (Array) ? jsonParsed['Active'] : [];
            tmp.Confirmation = {
                Prompted: (_b = (_a = jsonParsed === null || jsonParsed === void 0 ? void 0 : jsonParsed.Confirmation) === null || _a === void 0 ? void 0 : _a.Prompted) !== null && _b !== void 0 ? _b : false,
                State: (_d = (_c = jsonParsed === null || jsonParsed === void 0 ? void 0 : jsonParsed.Confirmation) === null || _c === void 0 ? void 0 : _c.State) !== null && _d !== void 0 ? _d : false
            };
            return tmp;
        }
        catch (err) {
            log.Error('Failed to parse json data');
            log.Error("ERROR:");
            log.Error(err);
            log.Error("JSON:");
            log.Error({ jsonData });
            (0, process_1.exit)(1);
        }
    }
    /**
     *
     * @param path the path of the JSON configuration file - default is LocalConfig.Path
     * @returns the local configuration in LocalConfig form, parsed
     */
    static Load(path) {
        path = path ? path : this.Path();
        try {
            if (!path) {
                return Status.InitStatus();
            }
            return this.fromJSON((0, fs_1.readFileSync)(path).toString());
        }
        catch (err) {
            log.Error("Failed to load the Status file");
            log.Error({ err });
            process.exit(1);
        }
    }
    /**
     *
     * @param status the Status object to be serialized
     * @param path the path the file should be saved to - default is Status.Path()
     * @returns the same status object
     */
    static Save(status, path) {
        path = path ? path : this.Path();
        // convert to JSON string, ignore undefined values
        let statusJson = JSON.stringify(status, null, 4);
        // let statusJson = JSON.stringify(status, (key, val) => {
        //     if (val !== undefined) {
        //         return val
        //     }
        // }, 4)
        (0, fs_1.writeFileSync)(path, statusJson);
        return status;
    }
    /**
     *
     * @returns the path of the status file
     */
    static Path() {
        let directory = this.Directory();
        let path = `${directory}/status.json`;
        if (!(0, fs_1.existsSync)(path)) {
            // autoinitiating because a status file is always necessary
            Status.InitStatus();
        }
        return path;
    }
    /**
     *
     * @returns the directory of the status file
     */
    static Directory() {
        // default directories, in order of priority
        let localDir = (0, path_1.ResolveUri)('~/.config/admiral');
        // if (!existsSync(localDir)) {
        //     mkdirSync(localDir, { recursive: true })
        // }
        return localDir;
    }
    /**
     *
     * Generates a default status file in the default ~/.config/admiral folder
     */
    static InitStatus(status) {
        let directory = (0, path_1.ResolveUri)("~/.config/admiral");
        if (!(0, fs_1.existsSync)(directory)) {
            (0, fs_1.mkdirSync)(directory, { recursive: true });
        }
        let statusPath = `${directory}/status.json`;
        if (!(0, fs_1.existsSync)(statusPath)) {
            return Status.Save(status !== null && status !== void 0 ? status : new Status(), (0, path_1.ResolveUri)(statusPath));
        }
        return Status.Load(statusPath);
    }
}
exports.Status = Status;
//# sourceMappingURL=status.js.map