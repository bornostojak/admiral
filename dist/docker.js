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
exports.listContainerNames = exports.listServiceNames = exports.listNodeNames = exports.Deploy = exports.ConvertServerToSSHConnInfo = exports.ConnectToDockerOverSSH = void 0;
const logging_js_1 = __importDefault(require("./logging.js"));
const dockerode_1 = __importDefault(require("dockerode"));
const sockets_js_1 = __importDefault(require("./connections/sockets.js"));
const crypto_1 = __importDefault(require("crypto"));
const yamljs_1 = __importDefault(require("yamljs"));
const fs = __importStar(require("fs"));
const manager_js_1 = __importDefault(require("./config/manager.js"));
let log = new logging_js_1.default("Docker management");
function ConnectToDockerOverSSH(sshConnectionParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                log.Debug("Creating a bound socket...");
                let localSocketPath = "/tmp/docker_" + crypto_1.default.randomUUID().slice(0, 8) + ".sock";
                let remoteSocketPath = "/var/run/docker.sock";
                log.Debug({ localSocketPath, remoteSocketPath });
                yield (0, sockets_js_1.default)(remoteSocketPath, localSocketPath, sshConnectionParameters);
                log.Debug(`Remote socket bound to local socket <blue>${localSocketPath}</blue>`);
                let node = new dockerode_1.default({ socketPath: localSocketPath });
                log.Debug("A node has successfully attached");
                resolve(node);
            }
            catch (err) {
                log.Error(err);
                reject(err);
            }
        }));
    });
}
exports.ConnectToDockerOverSSH = ConnectToDockerOverSSH;
function ConvertServerToSSHConnInfo(server) {
    var _a, _b;
    let localConfig = manager_js_1.default.GetLocalConfigSync();
    if ((_a = localConfig === null || localConfig === void 0 ? void 0 : localConfig.ssh) === null || _a === void 0 ? void 0 : _a.privateKey) {
        let info = { debug: true, host: server["host"], port: server["port"], username: server["username"], privateKey: Buffer.from((_b = localConfig === null || localConfig === void 0 ? void 0 : localConfig.ssh) === null || _b === void 0 ? void 0 : _b.privateKey, 'utf-8') };
        log.Print(info);
        return info;
    }
    let info = { host: server["host"], port: server["port"], username: server["username"], password: server["password"] };
    log.Print(info);
    return info;
}
exports.ConvertServerToSSHConnInfo = ConvertServerToSSHConnInfo;
function Deploy(docker, stack, project) {
    return __awaiter(this, void 0, void 0, function* () {
        // Read the YAML file and convert it to a JavaScript object
        const yamlFile = fs.readFileSync('/path/to/service.yaml', 'utf8');
        const serviceConfig = yamljs_1.default.parse(yamlFile);
        // Deploy the Docker service using the configuration from the YAML file
        const service = yield docker.createService(serviceConfig);
        yield service.inspect();
    });
}
exports.Deploy = Deploy;
//export function getNodes(node: Docker) {
//    return new Promise((resolve, reject) => {
//        node.listNodes((err, nodes) => {
//            if (err)
//                reject(err)
//            resolve(nodes)
//        })
//    }).catch(null)
//}
//
//export function getServices(node: Docker) {
//    return new Promise<Docker.Service[] | undefined>((resolve, reject) => {
//        node.listServices((err, services) => {
//            if (err)
//                reject(err)
//            resolve(services)
//        })
//    }).catch(null)
//}
//
//export function getContainers(node: Docker) {
//    return new Promise<Docker.ContainerInfo[] | undefined>((resolve, reject) => {
//        node.listContainers((err, containers) => {
//            if (err)
//                reject(err)
//            resolve(containers)
//        })
//    }).catch(null)
//}
//
function listNodeNames(node) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        return (_b = (_a = (yield node.listNodes())) === null || _a === void 0 ? void 0 : _a.map(s => s["Description"]["Hostname"])) === null || _b === void 0 ? void 0 : _b.flat().map(c => c === null || c === void 0 ? void 0 : c.replace(/^\//, ""));
    });
}
exports.listNodeNames = listNodeNames;
function listServiceNames(node) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        return (_b = (_a = (yield node.listServices())) === null || _a === void 0 ? void 0 : _a.map(s => s.Spec)) === null || _b === void 0 ? void 0 : _b.map(s => s === null || s === void 0 ? void 0 : s.Name);
    });
}
exports.listServiceNames = listServiceNames;
function listContainerNames(node) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        return (_b = (_a = (yield node.listContainers())) === null || _a === void 0 ? void 0 : _a.map(s => s === null || s === void 0 ? void 0 : s.Names)) === null || _b === void 0 ? void 0 : _b.flat().map(c => c.replace(/^\//, ""));
    });
}
exports.listContainerNames = listContainerNames;
//# sourceMappingURL=docker.js.map