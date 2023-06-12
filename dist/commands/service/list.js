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
exports.ProcessCommand = exports.CommandOptions = void 0;
const fs_1 = __importDefault(require("fs"));
const docker_js_1 = require("../../docker.js");
const yargs_1 = __importDefault(require("yargs"));
const logging_1 = __importDefault(require("../../logging"));
const status_1 = require("../../config/status");
const process_1 = require("process");
const path_1 = __importDefault(require("path"));
const manager_js_1 = __importStar(require("../../config/manager.js"));
const server_js_1 = require("../../config/server.js");
let log = new logging_1.default("Service List");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
};
function ProcessCommand(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ service_list: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
        let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
        if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help)) {
            PrintHelp();
            (0, process_1.exit)(0);
        }
        let status = status_1.Status.Load();
        for (let activeProject of status.Active) {
            let activeProjectServersFilePath = path_1.default.join((0, manager_js_1.GetLocalConfigLocation)(), "projects", activeProject, "servers.json");
            let localConfig = manager_js_1.default.GetLocalConfigSync();
            if (!fs_1.default.existsSync(activeProjectServersFilePath)) {
                log.Print(`No "servers.json" file exists for project <red>${activeProject}</red>`);
                continue;
            }
            // let serversFile = JSON.parse(fs.readFileSync(activeProjectServersFilePath).toString())
            // let first = serversFile[0]
            let servers = yield (0, server_js_1.GrabServers)(activeProject);
            let first = servers[0];
            let fo = (0, docker_js_1.ConvertServerToSSHConnInfo)(first);
            log.Print(`Project <b><red>${activeProject}</red></b>:`);
            try {
                let docker = yield (0, docker_js_1.ConnectToDockerOverSSH)(fo
                // {
                // username: first.username,
                // host: first.host,
                // port: first.port,
                // password: first.password
                // }
                );
                let services = yield docker.listServices();
                // log.Print(JSON.stringify(services, null ,4))
                log.Print(services.map(s => { var _a; return `<cyan>${(_a = s === null || s === void 0 ? void 0 : s.Spec) === null || _a === void 0 ? void 0 : _a.Name}</cyan>`; }).join('\n  ').replace(/^/g, '  '));
                log.Print();
            }
            catch (err) {
                log.Error(err);
            }
            (0, process_1.exit)(0);
        }
        //let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
    });
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('');
}
//# sourceMappingURL=list.js.map