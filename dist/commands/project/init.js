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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessCommand = exports.CommandOptions = void 0;
const fs_1 = __importStar(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const logging_js_1 = __importDefault(require("../../logging.js"));
const process_1 = require("process");
const project_js_1 = __importDefault(require("../../config/project.js"));
const path_1 = __importDefault(require("path"));
let log = new logging_js_1.default("Project(init)");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
};
function ProcessCommand(args) {
    log.Trace({ project_init: args });
    let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
    let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
    let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
    if (parsedArgs._.length > 2) {
        log.Error("<red><b>Multiple project names specified. Please run the command project by project, one by one</b></red>");
        (0, process_1.exit)(1);
    }
    if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help) || ((parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.length) == 1 && args.length == 1)) {
        PrintHelp();
        (0, process_1.exit)(0);
    }
    let projectName = String(parsedArgs._[1]);
    if (project_js_1.default.ListProjectNames().includes(projectName)) {
        log.Error(`<b>Project <red><b>${projectName}</b></red> already exists</b>`);
        (0, process_1.exit)(1);
    }
    let projectPath = path_1.default.join(project_js_1.default.Directory(), projectName);
    if ((0, fs_1.existsSync)(projectPath)) {
        log.Error(`<b>Project <red><b>${projectName}</b></red> already initiated</b>`);
        (0, process_1.exit)(1);
    }
    log.Debug(`Initiation new project: ${projectName}`);
    log.Debug(`New project location: ${projectPath}`);
    try {
        fs_1.default.mkdirSync(projectPath, { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(projectPath, "scripts"), { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(projectPath, "shared"), { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(projectPath, "servers"), { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(projectPath, "stacks"), { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(projectPath, ".env"), { recursive: true });
        fs_1.default.writeFileSync(path_1.default.join(projectPath, "notes.json"), "", { flag: 'w+' });
        fs_1.default.writeFileSync(path_1.default.join(projectPath, "upgrade.json"), "", { flag: 'w+' });
        fs_1.default.writeFileSync(path_1.default.join(projectPath, "production.env"), "", { flag: 'w+' });
        fs_1.default.writeFileSync(path_1.default.join(projectPath, "staging.env"), "", { flag: 'w+' });
        fs_1.default.writeFileSync(path_1.default.join(projectPath, "theater.env"), "", { flag: 'w+' });
    }
    catch (err) {
        log.Error("<b>An error occurred during the attempt to create the new project:</b>");
        log.Error(err.message);
        log.Trace(err);
        (0, process_1.exit)(1);
    }
    log.Debug(`<green>Initiation successful, new project created: ${projectName}<green>`);
    log.Debug(`Starting the creation of the project config...`);
    project_js_1.default.Init(projectName);
    log.Print(`<green>Successfully initialized new project: <cyan><b>${projectName}</b></cyan></green>`);
    (0, process_1.exit)(0);
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('    <red>project init</red> [OPTIONS] <b><cyan><PROJECT></cyan></b>');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    Create a new project.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -h, --help                 print help');
    help.Print('');
}
//# sourceMappingURL=init.js.map