"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectName = void 0;
const fs_1 = require("fs");
const path_js_1 = require("../helper/path.js");
const ssh_js_1 = require("./ssh.js");
const logging_js_1 = __importDefault(require("../logging.js"));
const logging_js_2 = __importDefault(require("./logging.js"));
const process_1 = require("process");
exports.ProjectName = 'Admiral';
let Log = new logging_js_1.default("Config(Local)");
var ConfirmationEnum;
(function (ConfirmationEnum) {
    ConfirmationEnum[ConfirmationEnum["always"] = 4] = "always";
    ConfirmationEnum[ConfirmationEnum["critical"] = 2] = "critical";
    ConfirmationEnum[ConfirmationEnum["once"] = 1] = "once";
    ConfirmationEnum[ConfirmationEnum["never"] = 0] = "never";
})(ConfirmationEnum || (ConfirmationEnum = {}));
class LocalConfig {
    constructor() {
        this.Confirmation = ConfirmationEnum.always;
        this.SSH = new ssh_js_1.SSHCredentials();
        this.Logging = logging_js_2.default.Load();
    }
    /**
     *
     * @param indent the indentation of the a JSON object
     * @returns the JSON string
     */
    toJSON() {
        let _a = this.SSH, { Username, Password, PrivateKey, PublicKey } = _a, _ = __rest(_a, ["Username", "Password", "PrivateKey", "PublicKey"]);
        let _b = this, { Visual, Editor } = _b, __ = __rest(_b, ["Visual", "Editor"]);
        let json = {
            Visual,
            Editor,
            Confirmation: ConfirmationEnum[this.Confirmation],
            Logging: this.Logging.toObject(),
            SSH: { Username, Password, PrivateKey, PublicKey },
        };
        return json;
    }
    /**
     *
     * @param jsonData the local configuration data string in JSON format
     * @returns the LocalConfig object
     */
    static fromJSON(jsonData) {
        var _a;
        try {
            let jsonParsed = JSON.parse(jsonData);
            Log.Log(JSON.stringify(jsonParsed, null, 0));
            let tmp = new LocalConfig();
            tmp.Confirmation = Object(ConfirmationEnum)[(_a = jsonParsed['Confirmation']) !== null && _a !== void 0 ? _a : 'always'];
            tmp.SSH = new ssh_js_1.SSHCredentials(jsonParsed['SSH']);
            tmp.Logging = new logging_js_2.default(jsonParsed['Logging']);
            tmp.Visual = jsonParsed['Visual'];
            tmp.Editor = jsonParsed['Editor'];
            return tmp;
        }
        catch (err) {
            Log.Error("An error occurred while parsing the local configuration");
            Log.Error(err);
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
            let localConfig = new LocalConfig();
            let localConfigJson = (0, fs_1.readFileSync)(path).toString();
            Log.Trace(localConfigJson);
            return LocalConfig.fromJSON(localConfigJson);
        }
        catch (err) {
            if (path)
                Log.Error(`<red><b>The configuration from '${path}' could not be loaded!</b></red>`);
            else
                Log.Error(`<red><b>A local configuration hasn't been defined yet!</b></red>`);
            Log.Error();
            Log.Error(`run <cyan><b>admiral config init</b></cyan>`);
            process.exit(1);
        }
    }
    /**
     *
     * @param config the LocalConfig object to be serialized
     * @param path the path the file should be saved to - default is LocalConfig.Path()
     * @returns the same config object
     */
    static Save(config, path) {
        path = path ? path : this.Path();
        if (!path) {
            LocalConfig.InitLocalConfig(config);
            return config;
        }
        (0, fs_1.writeFileSync)(path, JSON.stringify(config, (key, val) => {
            if (val !== undefined) {
                return val;
            }
        }, 4));
        return config;
    }
    /**
     *
     * @returns the path of the local configuration file
     */
    static Path() {
        let directory = this.Directory();
        let path = `${directory}/config.json`;
        if (!(0, fs_1.existsSync)(path)) {
            return "";
            // this.InitLocalConfig()
        }
        return path;
    }
    /**
     *
     * The directory of the local configuration file
     */
    static Directory(initIfMissing) {
        // default directories, in order of priority
        let directories = [".admiral", "~/.admiral", "~/.config/admiral"].map(d => (0, path_js_1.ResolveUri)(d));
        let location = '';
        for (location of directories) {
            // skip if not missing
            if (!(0, fs_1.existsSync)(location))
                continue;
            // return the first existing path
            return location;
        }
        // finally, if nothing exists, create the last folder: ~/.config/admiral
        if (initIfMissing) {
            this.InitLocalConfig();
        }
        return location;
    }
    /**
     *
     * Generates a default local config in the default ~/.config/admiral folder
     */
    static InitLocalConfig(config) {
        let directory = (0, path_js_1.ResolveUri)("~/.config/admiral");
        if (!(0, fs_1.existsSync)(directory)) {
            (0, fs_1.mkdirSync)(directory, { recursive: true });
        }
        let configPath = `${directory}/config.json`;
        if (!(0, fs_1.existsSync)(configPath)) {
            return LocalConfig.Save(config !== null && config !== void 0 ? config : new LocalConfig(), (0, path_js_1.ResolveUri)(configPath));
        }
        return LocalConfig.Load();
    }
}
exports.default = LocalConfig;
//# sourceMappingURL=localConfig.js.map