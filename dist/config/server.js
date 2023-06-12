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
exports.GrabServers = exports.DockerRoleEnum = void 0;
const fs_1 = __importStar(require("fs"));
const manager_1 = require("./manager");
const logging_1 = __importDefault(require("../logging"));
const process_1 = require("process");
const path_1 = __importDefault(require("path"));
const status_1 = require("./status");
const project_1 = __importDefault(require("./project"));
const log = new logging_1.default('Servers');
var DockerRoleEnum;
(function (DockerRoleEnum) {
    DockerRoleEnum[DockerRoleEnum["manager"] = 1] = "manager";
    DockerRoleEnum[DockerRoleEnum["worker"] = 2] = "worker";
})(DockerRoleEnum = exports.DockerRoleEnum || (exports.DockerRoleEnum = {}));
class Server {
    constructor() {
        this.Hostname = "";
        this.IPv4 = "";
        this.IPv6 = "";
        this.SSHPort = 22;
        this.Tags = [];
        this.DNS = {
            FQDN: [],
            Nameservers: [],
            Hosts: {}
        };
        this.Docker = {
            Role: DockerRoleEnum.worker,
            Labels: {},
            CgroupVersion: "2",
            DaemonConfig: {}
        };
    }
    toJSON() {
        var _a;
        return Object.fromEntries(Object.entries({
            Hostname: this.Hostname,
            IPv4: this.IPv4,
            IPv6: this.IPv6,
            SSHPort: this.SSHPort,
            Tags: this.Tags.map(t => String(t)),
            DNS: this.DNS,
            Docker: {
                Role: (_a = Object.entries(DockerRoleEnum).filter(([k, v]) => v === this.Docker.Role)[0][0]) !== null && _a !== void 0 ? _a : 'worker',
                Labels: this.Docker.Labels,
                CgroupVersion: this.Docker.CgroupVersion,
                DaemonConfig: this.Docker.DaemonConfig,
            }
        }));
    }
    static fromJSON(arg) {
        var _a;
        log.Trace({ "Parsing SERVER, JSON data": arg });
        let server = new Server();
        try {
            let parsedJson;
            if (typeof arg === "string") {
                parsedJson = JSON.parse(arg);
            }
            else {
                parsedJson = arg;
            }
            server.Hostname = parsedJson.Hostname;
            server.IPv4 = parsedJson.IPv4;
            server.IPv6 = parsedJson.IPv6;
            server.DNS = parsedJson.DNS;
            server.SSHPort = parsedJson.SSHPort;
            server.Docker = {
                Role: (_a = Object.entries(DockerRoleEnum).filter(([key, val]) => { var _a; return (_a = val === parsedJson.Docker.Level) !== null && _a !== void 0 ? _a : 'worker'; }).map(([k, v]) => v)[0]) !== null && _a !== void 0 ? _a : DockerRoleEnum.worker,
                Labels: parsedJson.Docker.Labels,
                CgroupVersion: parsedJson.Docker.CgroupVersion,
                DaemonConfig: parsedJson.Docker.DaemonConfig
            };
            server.Tags = parsedJson.Tags.map(t => t);
        }
        catch (err) {
            log.Error("Encountered error while parsing server json string");
            log.Error({ type: typeof arg, jsonData: arg });
            log.Error("Error:");
            log.Error(err);
            (0, process_1.exit)(1);
        }
        return server;
    }
    static LoadServersForProject(project) {
        log.Debug(`Getting servers for project: ${project}`);
        // let projectDir = path.join(LocalConfig.Directory(), "projects")
        // let projectDir = LocalProjectDirectory
        let projectDir = project_1.default.Directory();
        let projectServerDirPath = path_1.default.join(projectDir, project, "servers");
        if (!(0, fs_1.existsSync)(projectServerDirPath)) {
            log.Debug(`No <red>servers</red> folder was defined for project ${project}`);
            return [];
        }
        let projectDirInfo = (0, fs_1.readdirSync)(projectServerDirPath, { withFileTypes: true });
        let serverDirArray = projectDirInfo.filter((pd) => pd.isDirectory() && !pd.name.startsWith('.')).map((pd) => path_1.default.join(projectServerDirPath, pd.name));
        let serverConfigFilePathArray = serverDirArray.map(pd => path_1.default.join(pd, "server.json"));
        let missingServerConfigFiles = serverConfigFilePathArray.filter(scf => !(0, fs_1.existsSync)(scf));
        if (missingServerConfigFiles.length > 0) {
            log.Debug("Missing server config file in following server configurations:");
            log.Debug("  " + missingServerConfigFiles.map(scf => `<red><b>${scf}</b></red>`).join('\n  '));
        }
        let servers = serverConfigFilePathArray.filter(s => !missingServerConfigFiles.includes(s)).map(s => Server.LoadFromFile(s));
        return servers;
    }
    static LoadFromFile(path) {
        log.Debug(`Parsing Server file: ${path}`);
        if (!(0, fs_1.existsSync)(path)) {
            log.Error(`Error parsing <red>${path}</red> as server: missing file`);
            (0, process_1.exit)(1);
        }
        let serverFileContent = (0, fs_1.readFileSync)(path).toString();
        log.Trace({ objective: "Parsing server file to server", path, serverFileContent });
        return Server.fromJSON(serverFileContent);
    }
}
exports.default = Server;
function GrabServers(project) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = status_1.Status.Load();
        let serversFilePath = path_1.default.join((0, manager_1.GetLocalConfigLocation)(), "projects", project, "servers.json");
        let serversFile = yield fs_1.default.promises.readFile(serversFilePath);
        try {
            let servers = JSON.parse(serversFile.toString());
            //TODO: verify the server file
            return servers;
        }
        catch (err) {
            log.Debug(`Servers file for <red>${project}</red> not found!`);
            log.Trace(err);
            return Array();
        }
    });
}
exports.GrabServers = GrabServers;
class IPv4 {
    get Value() {
        return this._value;
    }
    constructor(arg) {
        this._address = '0.0.0.0';
        this._value = 0;
        let parsedValue = IPv4.ConvertIPToValue(arg);
        if (isNaN(parsedValue))
            return;
        this._value = parsedValue;
    }
    MaskedBy(mask) {
        if (typeof mask === "string") {
            mask = new IPv4(mask);
        }
        return IPv4.ConvertValueToIP((this._value & mask.Value) >>> 0);
    }
    get Address() {
        return IPv4.ConvertValueToIP(this._value);
    }
    set Address(ip) {
        if (!IPv4.Validate(ip)) {
            log.Error(`<red><b>Invalid IP address assignment:</b></red> ${ip}`);
        }
        this._value = IPv4.ConvertIPToValue(ip);
    }
    static Validate(ip) {
        if (ip.length > 15 || ip.length < 7) {
            return false;
        }
        let octets = ip.split('.');
        if (octets.length != 4) {
            return false;
        }
        let ipValidator = octets
            .map(x => parseInt(x))
            .filter(x => !isNaN(x) && x >= 0 && x < 256);
        return;
    }
    static ConvertValueToIP(value) {
        log.Debug(`Converting Value to IP: ${value}`);
        if (value > 4294967295 || value < 0) {
            return "0.0.0.0";
        }
        let valueArray = [value >> 24, value >> 16, value >> 8, value].map(v => v & 255);
        log.Debug(`Values: ${valueArray}`);
        return valueArray.join('.');
    }
    static ConvertIPToValue(ip) {
        if (!IPv4.Validate(ip)) {
            return NaN;
        }
        log.Debug(`Converting IP to Value: ${ip}`);
        let octets = ip.split('.').map(o => parseInt(o));
        log.Debug(`Octets: ${octets}`);
        let octetBits = [(octets[0] << 24) >>> 0, (octets[1] << 16) >>> 0, (octets[2] << 8) >>> 0, octets[3]];
        log.Debug(`Bits: ${octetBits}`);
        let result = octetBits.reduce((agr, val) => agr + val);
        log.Debug(`IP as value: ${result}`);
        return result;
    }
    static Mask(ip, mask) {
        if (typeof ip === "string") {
            ip = new IPv4(ip);
        }
        if (typeof mask === "string") {
            mask = new IPv4(mask);
        }
        return new IPv4(ip.MaskedBy(mask));
    }
}
//# sourceMappingURL=server.js.map