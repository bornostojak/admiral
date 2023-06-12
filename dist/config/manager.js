"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessCommand = exports.ProcessCommandSync = exports.ConfigLocations = exports.GetLocalConfigLocation = exports.Locations = exports.ProjectName = void 0;
const yaml = __importStar(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const path_js_1 = require("../helper/path.js");
const ssh_js_1 = require("./ssh.js");
exports.ProjectName = 'Admiral';
class Config {
    constructor() {
        this.logging = {
            level: 1,
            debug: 0,
        };
    }
    get Path() {
        return GetLocalConfigLocation();
    }
    static LoadFromStringSync(configString) {
        var _a;
        configString = configString.replace('"private_key"', '"privateKey"').replace('"public_key"', '"publicKey"');
        let parsed = yaml.load(configString);
        let tmp = new Config();
        if ("ssh" in parsed) {
            tmp.ssh = (_a = new ssh_js_1.SSHCredentials(parsed['ssh'])) !== null && _a !== void 0 ? _a : undefined;
        }
        if ('logging' in parsed)
            tmp.logging = Object.assign(Object.assign({}, tmp.logging), parsed['logging']);
        return tmp;
    }
    static LoadFromString(configString) {
        return new Promise((resolve, reject) => {
            try {
                resolve(Config.LoadFromStringSync(configString));
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static GetLocalConfigSync() {
        let configFile = Config.GetLocalConfigFilesSync(['config.json']).slice(0).join();
        if (configFile) {
            //log(`Loading from file: <blue>${configFile}</blue>`)
            let config = Config.LoadFromStringSync(fs_1.default.readFileSync(configFile).toString());
            return config;
        }
    }
    static GetLocalConfig() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                let configFile = (yield Config.GetLocalConfigFiles(['config.json'])).slice(0).join();
                if (configFile) {
                    //log(`Loading from file: <blue>${configFile}</blue>`)
                    let config = Config.LoadFromString((yield fs_1.default.promises.readFile(configFile)).toString());
                    res(config);
                }
            }
            catch (err) {
                rej(err);
            }
        }));
    }
    static GetLocalConfigFilesSync(filenames = null) {
        var _a, _b;
        let dirs = (_a = ConfigLocations({ exists: true })) === null || _a === void 0 ? void 0 : _a.local;
        let dir = dirs.reverse()[0];
        let dirEntries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        let files = (_b = dirEntries === null || dirEntries === void 0 ? void 0 : dirEntries.filter(f => f.isFile() && (filenames === null ? true : filenames.includes(f.name)))) === null || _b === void 0 ? void 0 : _b.map(f => path_1.default.join(dir, f.name));
        return files;
    }
    static GetLocalConfigFiles(filenames = null) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                let dirs = (_a = ConfigLocations({ exists: true })) === null || _a === void 0 ? void 0 : _a.local;
                let dir = dirs.reverse()[0];
                let dirEntries = yield fs_1.default.promises.readdir(dir, { withFileTypes: true });
                let files = (_b = dirEntries === null || dirEntries === void 0 ? void 0 : dirEntries.filter(f => f.isFile() && (filenames === null ? true : filenames.includes(f.name)))) === null || _b === void 0 ? void 0 : _b.map(f => path_1.default.join(dir, f.name));
                res(files);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
}
exports.default = Config;
//TODO: support a location that can be defined using ADMIRAL_CONFIG env variable, useful for testing
exports.Locations = {
    global: [
        '/etc/admiral'
    ].map(f => (0, path_js_1.ResolveUri)(f)),
    local: [
        ".admiral",
        "~/.admiral",
        "~/.config/admiral/"
    ].map(f => (0, path_js_1.ResolveUri)(f))
};
function GetLocalConfigLocation(options = undefined) {
    var _a;
    return (_a = ConfigLocations({ exists: true })) === null || _a === void 0 ? void 0 : _a.local[0];
}
exports.GetLocalConfigLocation = GetLocalConfigLocation;
function ConfigLocations(options = undefined) {
    let dirs = Object.entries(exports.Locations).map(([k, v]) => [k, v.filter(f => !options || (options['exists'] && fs_1.default.existsSync(f)))]);
    return Object.fromEntries(dirs);
}
exports.ConfigLocations = ConfigLocations;
const commandSynonyms = {
    logging: "Logging",
    ssh: "SSH"
};
function ProcessCommandSync(commands) {
    ProcessCommand(commands).then((res) => {
        return res;
    });
}
exports.ProcessCommandSync = ProcessCommandSync;
function ProcessCommand(commands) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield Config.GetLocalConfig();
        try {
            commands.forEach(command => {
                let assign = command.split('=').slice(1).join('=');
                let location = command.split('=').slice(0, 1).join().split('.');
                let root = config;
                let broken = false;
                for (let i = 0; i < location.length; i++) {
                    let loc = location[i];
                    //if (Object.keys(commandSynonyms).includes(loc)) loc = commandSynonyms[command]
                    if (!Object.keys(root).includes(loc)) {
                        broken = true;
                        break;
                    }
                    root = root[loc];
                }
                if (!assign) {
                    //log({[location.join('.')]: root})//, "Process Command")
                }
            });
        }
        catch (_a) {
        }
    });
}
exports.ProcessCommand = ProcessCommand;
//if (c.SSH?.privateKey)
//console.log(fs.readFileSync(ResolveUri(c.SSH.privateKey)).toString())
//log.log(JSON.stringify(await GetLocalConfigFiles(['config.yaml'])))
//await fs.promises.readFile('')
//# sourceMappingURL=manager.js.map