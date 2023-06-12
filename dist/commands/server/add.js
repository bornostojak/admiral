"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessCommand = exports.CommandOptions = void 0;
const fs_1 = require("fs");
const yargs_1 = __importDefault(require("yargs"));
const logging_js_1 = __importDefault(require("../../logging.js"));
const status_js_1 = require("../../config/status.js");
const process_1 = require("process");
const json_js_1 = require("../helpers/json.js");
const server_js_1 = __importDefault(require("../../config/server.js"));
const readline_1 = __importDefault(require("readline"));
const project_js_1 = __importDefault(require("../../config/project.js"));
const path_1 = __importDefault(require("path"));
var rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
let log = new logging_js_1.default("<TEMPLATE>");
exports.CommandOptions = {
    "help": { boolean: true, alias: 'h' },
    "template": { boolean: true, alias: 't' },
    "number": { number: true, alias: 'n', default: 1 },
};
function ProcessCommand(args) {
    log.Trace({ server_add: args });
    let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
    let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(0, 1).join('');
    let subcommand = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1, 2).join('');
    let status = status_js_1.Status.Load();
    if (parsedArgs.number <= 0) {
        log.Error(`Incorrect "number" argument <red>"${parsedArgs.number}"</red>: must be greater than 0`);
        (0, process_1.exit)(1);
    }
    if (!process.stdin.isTTY) {
        try {
            let addedServers = JSON.parse((0, fs_1.readFileSync)(0, 'utf-8').toString());
            for (let [projectName, newServers] of Object.entries(addedServers)) {
                if (!project_js_1.default.ListProjectNames().includes(projectName)) {
                    log.Error(`The project <red><b>${projectName}</b></red> doesn't exists. Please init the project using\n\t<red><i>admiral project init ${projectName}</i></red>`);
                    (0, process_1.exit)(1);
                }
                // i'll skip this for now, need to figure out a prompt that
                // allows skipping by default if the project is not active
                /*
                * if (!status.Active.includes(projectName)) {
                *     let result = "N"
                *     rl.question(Formatting(`The project <red><b>${projectName}</b></red> is not active, proceed anyway? [y/N]:`), (res) => {
                *         result = res.toLocaleLowerCase()
                *     })
                *     if (result !== 'y') {
                *         log.Debug(log.Print(Formatting(`Project <red><b>${projectName}</b></red> skipped!`)))
                *         continue
                *     }
                * }
                */
                let projectPath = path_1.default.join(project_js_1.default.Directory(), projectName);
                for (let server of newServers) {
                    let serverDirName = path_1.default.join(projectPath, "servers", server.Name);
                    if ((0, fs_1.existsSync)(serverDirName)) {
                        log.Error(`The server <red><b>${projectName}/${server.Name}</b></red> you're trying to define already exists!`);
                        (0, process_1.exit)(1);
                    }
                    (0, fs_1.mkdirSync)(serverDirName, { recursive: true });
                    let serverFile = server_js_1.default.fromJSON(server);
                    let serverJson = serverFile.toJSON();
                    (0, fs_1.writeFileSync)(path_1.default.join(serverDirName, "server.json"), JSON.stringify(serverJson, null, 4), { flag: "w+" });
                    log.Log(log.Print(`Successfully added server <green><b>${projectName}/${server.Name}</b></green>.`));
                }
            }
            (0, process_1.exit)(0);
        }
        catch (err) {
            log.Error("An error occurred during the process of parsing the new server data:");
            log.Error(err.message);
            (0, process_1.exit)(1);
        }
    }
    if (subcommand == 'help' || (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.help) || ((parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.length) == 1 && args.length == 1)) {
        PrintHelp();
        (0, process_1.exit)(0);
    }
    if (parsedArgs.template) {
        let serverTemplates = Object.fromEntries(status.Active.map(p => [p, [...Array(parsedArgs.number)].map(_ => (Object.assign({ Name: "" }, (new server_js_1.default()).toJSON())))]));
        log.Print((0, json_js_1.ColorizedJSON)(serverTemplates));
        (0, process_1.exit)(0);
    }
    for (let activeProject of status.Active) {
    }
}
exports.ProcessCommand = ProcessCommand;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('    <red>admiral server add</red> [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('    Add additional servers to the currently selected projects.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print('    -h, --help                 print help');
    help.Print('    -t, --template             generate a template for each of the currently active servers');
    help.Print('    -n, --number               generate a "n" number of servers templates for each project');
    help.Print('');
}
//# sourceMappingURL=add.js.map