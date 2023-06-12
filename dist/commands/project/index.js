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
const process_1 = require("process");
const List = __importStar(require("./list"));
const Select = __importStar(require("./select"));
const Init = __importStar(require("./init"));
let log = new logging_1.default("Project");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
    "list": { boolean: true, alias: 'l' },
};
let definedSubcommands = [
    "list",
    "ls"
];
function ProcessCommand(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ list_args: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
        let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
        switch (subcommand) {
            case "active":
            case "selected":
                yield Select.ProcessCommand(['select', '-s', ...args.filter(f => f != 'select')]);
                break;
            case "init":
                yield Init.ProcessCommand(args.slice(1));
                break;
            case "ls":
            case "list":
                yield List.ProcessCommand(args.slice(1));
                break;
            case "deselect":
            case "select":
                yield Select.ProcessCommand(args.slice(1));
                break;
        }
        if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help) || (command == "project" && args.length == 1) || (subcommand) && !definedSubcommands.includes(subcommand)) {
            PrintHelp();
            (0, process_1.exit)(0);
        }
        if (command != "project") {
            PrintHelp();
            (0, process_1.exit)(1);
        }
    });
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('    <red>project</red> [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    Manager active projects.');
    help.Print('');
    help.Print('COMMANDS:');
    help.Print('    <red>active, selected</red>           list active projects');
    help.Print('    <red>deselect</red>                   deselect one or more projects');
    help.Print('    <red>init</red>                       initiate an empty new project');
    help.Print('    <red>list, ls</red>                   list existing projects');
    help.Print('    <red>select</red>                     select one or more projects');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -h, --help                 print help');
    help.Print('');
}
//# sourceMappingURL=index.js.map