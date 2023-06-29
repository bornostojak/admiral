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
exports.PrintHelp = void 0;
const logging_js_1 = __importDefault(require("../logging.js"));
const yargs_1 = __importDefault(require("yargs/yargs"));
// import * as Select from './select'
const Select = __importStar(require("./project/select"));
const Deploy = __importStar(require("./deploy"));
const Service = __importStar(require("./service"));
const List = __importStar(require("./list"));
const Server = __importStar(require("./server"));
const Project = __importStar(require("./project"));
const ConfigCmd = __importStar(require("./config"));
const localConfig_js_1 = __importDefault(require("../config/localConfig.js"));
const status_js_1 = require("../config/status.js");
const project_js_1 = __importDefault(require("../config/project.js"));
const log = new logging_js_1.default("Command Parser");
// separate the last output of the command with and empty line
// for easier reading purposes
process.on('exit', (code) => {
    if (code === -1) {
        process.exitCode = 0;
        return;
    }
    console.log();
});
function ProcessArguments(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let parsedArgs = Object((0, yargs_1.default)(args).help(false).argv);
        let command = parsedArgs._.slice(0, 1).join('');
        let subcommands = parsedArgs._.slice(1);
        delete parsedArgs["$0"];
        delete parsedArgs["_"];
        log.Trace({ command, subcommands, options: parsedArgs });
        localConfig_js_1.default.InitLocalConfig();
        project_js_1.default.InitProjectConfig();
        status_js_1.Status.InitStatus();
        if (command === 'help') {
            PrintHelp();
        }
        switch (command) {
            case "a":
            case "active":
            case "selected":
                Select.ProcessCommand(['select', '-a', ...args.filter(f => f != 'select')]);
                break;
            case "config":
                yield ConfigCmd.ProcessCommand(args);
                break;
            case "deploy":
                yield Deploy.ProcessCommand(args);
                break;
            case "ds":
                yield Select.ProcessCommand(["deselect", "all"]);
                break;
            case "deselect":
                yield Select.ProcessCommand(args);
                break;
            case "list":
                yield List.ProcessCommand(args);
                break;
            case "project":
                yield Project.ProcessCommand(args);
                break;
            case "select":
                yield Select.ProcessCommand(args);
                break;
            case "server":
                yield Server.ProcessCommand(args);
                break;
            case "service":
                yield Service.ProcessCommand(args);
                break;
            case "man":
                break;
            case "test":
                let testing = localConfig_js_1.default.Load();
                // let conf = await LocalConfig.Load()
                // log.Print(new SSHCredentials(conf.SSH).SSH2Login())
                break;
            default:
                commandNotFound(command);
                break;
        }
    });
}
exports.default = ProcessArguments;
function commandNotFound(command) {
    let run = process.argv[0].split('/').slice(-1).join('') === 'node'
        ? process.argv.slice(0, 2).map(f => f.split('/').slice(-1).join('')).join(' ')
        : process.argv[0].split('/').slice(-1).join('');
    log.Print("<b>MISSING COMMAND</b>");
    log.Print(`  <b><red>${command}</red></b> <b><u>is not</u></b> a recognized command!`);
    log.Print();
    log.Print(`To see all available commands, run:\n  <red>${run} help</red>`);
    log.Print();
    process.exit(1);
}
function PrintHelp() {
    //TODO: print help
    log.Print("USAGE");
    log.Print("    <red>admiral</red> [OPTIONS] COMMAND [ARGS]");
    log.Print();
    log.Print("DESCRIPTION");
    log.Print("    <red>admiral</red> is a command line program with the intention of making");
    log.Print("    the distribution, adjustment and deployment of one docker swarm codebase to multiple projects");
    log.Print("    easier, streamlined and sysadmin friendly. We will tear or hairs out, so you don't have to.");
    log.Print();
    log.Print("COMMANDS");
    log.Print("  Basics:");
    log.Print("    <red>deselect, ds</red>            deselect one or more currently active projects");
    log.Print("    <red>list</red>                    list additional information");
    log.Print("    <red>select</red>                  select one or more projects as active");
    log.Print();
    log.Print("  Management:");
    // log.Print("    <red>docker</red>                  manage docker - like running docker on the server")
    log.Print("    <red>project</red>                 manage projects");
    log.Print("    <red>rack</red>                    manage racks");
    log.Print("    <red>server</red>                  manage servers");
    log.Print("    <red>service</red>                 manage services");
    log.Print();
    log.Print("  Info:");
    log.Print("    <red>selected, active, a</red>     print out active projects");
    log.Print("    <red>troubleshooting</red>         create troubleshooting scripts and run them to help with issue localization and detection");
    log.Print();
    log.Print("  Serialization:");
    log.Print("    <red>exfiltrate</red>              serialize the current state of the stack");
    log.Print("    <red>dump</red>                    dump the current state of the docker stacks into a <project_name>.tar.gz file ");
    log.Print();
    process.exit(0);
}
exports.PrintHelp = PrintHelp;
//# sourceMappingURL=index.js.map