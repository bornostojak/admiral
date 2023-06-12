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
const yargs_1 = __importDefault(require("yargs"));
const logging_1 = __importDefault(require("../../logging"));
const status_1 = require("../../config/status");
const process_1 = require("process");
const helpers = __importStar(require("../helpers/index"));
const project_1 = __importDefault(require("../../config/project"));
let log = new logging_1.default("Servers list");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
    "unveil": { boolean: true, alias: 'u' },
    "show": { boolean: true, alias: 's' },
    "json": { boolean: true, alias: 'j' },
    "table": { boolean: true, alias: 't' },
    "hostname": { boolean: true },
    "hostname-only": { boolean: true },
};
function ProcessCommand(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ list_args: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
        let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
        let status = status_1.Status.Load();
        if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help)) {
            PrintHelp();
            (0, process_1.exit)(0);
        }
        let activeProjects = project_1.default.GetProjects().filter(p => status.Active.includes(p.Name));
        if (activeProjects.length == 0) {
            log.Print("<red><b>No projects are currently active.</b></red>");
            (0, process_1.exit)(1);
        }
        if (parsedArgs.table) {
            log.Print(helpers.Json.toTableString(Object.fromEntries(activeProjects.map(p => [[p.Name], p.Servers.map(s => s.toJSON())]))));
            (0, process_1.exit)(0);
        }
        if (parsedArgs.json) {
            log.Print(helpers.Json.ColorizedJSON(Object.fromEntries(activeProjects.map(p => [[p.Name], p.Servers.map(s => s.toJSON())]))));
            (0, process_1.exit)(0);
        }
        if (parsedArgs['hostname-only']) {
            for (let project of activeProjects) {
                for (let server of project.Servers) {
                    log.Print(server.Hostname);
                }
            }
            (0, process_1.exit)(0);
        }
        if (parsedArgs.hostname) {
            activeProjects.map(p => log.Print(helpers.Json.toIndentedStringify([{ Servers: p.Servers.map(s => s.Hostname) }], { title: "Project", value: p.Name })));
            (0, process_1.exit)(0);
        }
        activeProjects.map(p => log.Print(helpers.Json.toIndentedStringify(p.Servers.map(s => s.toJSON()), { title: "Project", value: p.Name })));
        (0, process_1.exit)(0);
    });
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('    <red>server list</red> [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    List the defined servers of the active projects.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -s, --show');
    help.Print('    -u, --unveil               reveal the username and password');
    help.Print('    -j, --json                 return in JSON format');
    help.Print('    -t, --table                print servers in table format');
    help.Print('    -h, --help                 print help');
    help.Print('    -hostname                  print server hostnames (indented)');
    help.Print('    -hostname-only             print only server hostnames (linear)');
    help.Print('');
}
//# sourceMappingURL=list.js.map