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
exports.ProcessCommand = exports.CommandOptions = exports.LocalProjectDirectory = void 0;
const fs_1 = require("fs");
const yargs_1 = __importDefault(require("yargs"));
const logging_1 = __importDefault(require("../../logging"));
const status_1 = require("../../config/status");
const process_1 = require("process");
const project_js_1 = __importStar(require("../../config/project.js"));
const path_1 = __importDefault(require("path"));
let log = new logging_1.default("Projects list");
const helpers = __importStar(require("../helpers/index"));
const json_1 = require("../helpers/json");
const config_1 = require("../../config");
exports.LocalProjectDirectory = path_1.default.join(config_1.LocalConfig.Directory(), 'projects');
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
    "all": { boolean: true, alias: 'a' },
    "list": { boolean: true, alias: 'l' },
    "table": { boolean: true, alias: 't' },
    "json": { boolean: true, alias: 'j' },
    "status": { string: true }
};
function ProcessCommand(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ list_args: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
        let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
        if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help)) {
            PrintHelp();
            (0, process_1.exit)(0);
        }
        let status = status_1.Status.Load();
        let projects = project_js_1.default.GetProjects();
        if (projects.length == 0) {
            log.Print("<b>You don't have any projects defined yet.</b>");
            (0, process_1.exit)(1);
        }
        if (!parsedArgs.all) {
            projects = projects.filter(p => status.Active.includes(p.Name));
        }
        if (projects.length == 0) {
            log.Print("No currently active projects");
            (0, process_1.exit)(0);
        }
        // filtering by status
        if (parsedArgs.status) {
            let validProjectStatusArray = Object.keys(project_js_1.ProjectStatus);
            validProjectStatusArray = validProjectStatusArray.slice(validProjectStatusArray.length / 2);
            let statusToFilterByArray = parsedArgs.status.split(',');
            // if a filter is not defined in the valid filters, log and abort
            // so a filter other than
            // - suspended
            // - active
            // - inactive
            let invalidFilters = statusToFilterByArray.filter(f => !validProjectStatusArray.includes(f));
            if (invalidFilters.length > 0) {
                log.Error("The following are invalid project status filters:");
                log.Error(`  ${invalidFilters.map(f => `<red>${f}</red>`).join('\n  ')}`);
                (0, process_1.exit)(1);
            }
            projects = projects.filter(p => statusToFilterByArray.includes(project_js_1.ProjectStatus[p.Status]));
        }
        if (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.list) {
            projects.forEach(p => {
                log.Print(`${p.Name}`);
            });
            (0, process_1.exit)(0);
        }
        if (!(0, fs_1.existsSync)(`${project_js_1.default.Directory()}`)) {
            log.Error(`No <b>projects</b> location detected\nPlease generate a projects location at <cyan>"${project_js_1.default.Directory()}/projects"</cyan>`);
            (0, process_1.exit)(1);
        }
        if (parsedArgs.json) {
            log.Print(helpers.Json.ColorizedJSON(projects.map(p => p.toJSON())));
            (0, process_1.exit)(0);
        }
        if (parsedArgs.table) {
            log.Print(helpers.Json.toTableString(projects.map(p => p.toJSON())));
            (0, process_1.exit)(0);
        }
        let projectStatusArray = projects.map(p => {
            switch (p.Status) {
                case project_js_1.ProjectStatus.active: return [p.Name, `<green>${project_js_1.ProjectStatus[p.Status].slice(0, 1).toUpperCase() + project_js_1.ProjectStatus[p.Status].slice(1)}</green>`];
                case project_js_1.ProjectStatus.inactive: return [p.Name, `<red>${project_js_1.ProjectStatus[p.Status].slice(0, 1).toUpperCase() + project_js_1.ProjectStatus[p.Status].slice(1)}</red>`];
                case project_js_1.ProjectStatus.suspended: return [p.Name, `<blue>${project_js_1.ProjectStatus[p.Status].slice(0, 1).toUpperCase() + project_js_1.ProjectStatus[p.Status].slice(1)}</blue>`];
                case project_js_1.ProjectStatus.initialized: return [p.Name, `<yellow>${project_js_1.ProjectStatus[p.Status].slice(0, 1).toUpperCase() + project_js_1.ProjectStatus[p.Status].slice(1)}</yellow>`];
            }
        });
        let statusesObject = Object.fromEntries(projectStatusArray);
        log.Print((0, json_1.toIndentedStringify)([statusesObject], { title: "Projects" }));
        (0, process_1.exit)(0);
    });
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('    <red>project list</red> [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    List all defined projects.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -h, --help                 print help');
    help.Print('    -l, --list                 only list project names, suitable for piping');
    help.Print('    -a, --all                  list all existing and defined projects');
    help.Print('    --status                   list only project with the specified statuses, separated by a comma symbol (i.e. inactive,active)');
    help.Print('');
}
//# sourceMappingURL=list.js.map