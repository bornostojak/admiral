"use strict";
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
const localConfig_1 = __importDefault(require("../../config/localConfig"));
let log = new logging_1.default("List");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
    "--init": { boolean: true },
};
function ProcessCommand(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ list_args: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
        let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
        let status = status_1.Status.Load();
        if (parsedArgs.init) {
            log.Log("Instantiating local config");
            let localConfig = localConfig_1.default.InitLocalConfig();
            log.Trace({ localConfig });
            (0, process_1.exit)(0);
        }
        if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help) || (command == "list" && args.length == 1)) {
            PrintHelp();
            (0, process_1.exit)(0);
        }
        if (command != 'config') {
            log.Print("<b>Wrong arguments passed to <red>list</red> command!</b>");
            (0, process_1.exit)(1);
        }
    });
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('    <red>config</red> [OPTIONS] COMMAND');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    Manager configuration and settings');
    help.Print('');
    help.Print('COMMANDS:');
    // help.Print('    <red>projects</red>       - list projects')
    // help.Print('    <red>servers</red>        - list servers')
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -h, --help                - print help');
    help.Print('    --init                    - instantiate a fresh configuration in the default folder');
    help.Print('');
}
//# sourceMappingURL=index.js.map