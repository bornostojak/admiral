#!/usr/bin/env node
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
const process_1 = require("process");
const logging_js_1 = __importDefault(require("./logging.js"));
const manager_js_1 = require("./config/manager.js");
const yargs_1 = __importDefault(require("yargs/yargs"));
const yargs_2 = __importDefault(require("yargs"));
const commands_1 = __importStar(require("./commands"));
let log = new logging_js_1.default(manager_js_1.ProjectName);
let argsUnparsed = process_1.argv.slice(2);
let command = yargs_2.default.help(false).argv._.slice(0, 1).join('');
let mobArgsUnparsed = command === '' ? argsUnparsed : argsUnparsed.slice(0, argsUnparsed.indexOf(command));
ProcessMainArgs(mobArgsUnparsed, command === '');
//console.log(JSON.stringify({mobArgs}, null, 4))
let commandArgsUnparsed = command === '' ? [] : argsUnparsed.slice(argsUnparsed.indexOf(command));
(0, commands_1.default)(commandArgsUnparsed);
//console.log({command, mobArgsUnparsed, commandArgsUnparsed})
//log.log(args)
//log.log()
//log.log(Object.fromEntries(Object.entries(args).filter(([k,v]) => !['$0', '_'].includes(k))))
//let args = yargs(process.argv).options({
//    test: {
//        type: 'boolean',
//        alias: 'test'
//    }
//}).argv
//// log.log(args)
//// log.log(Config.GetLocalConfigFilesSync())
//
//if (args){
//    switch(args[0]){
//        case 'config':
//            ProcessCommandSync(args.slice(1))
//            break
//    }
//}
process.on("SIGINT", () => (0, process_1.exit)(1));
function ProcessMainArgs(args, noCommandDefined) {
    let yargsMainOptions = {
        help: {
            type: 'boolean',
            alias: 'h'
        },
    };
    let mobArgs = (0, yargs_1.default)(args).help(false).options(yargsMainOptions).argv;
    // if there is no other arguments
    if (noCommandDefined && Object.entries(mobArgs).filter(([k, v]) => !['$0', '_'].includes(k)).length == 0) {
        (0, commands_1.PrintHelp)();
    }
    if (mobArgs['help']) {
        (0, commands_1.PrintHelp)();
    }
}
//# sourceMappingURL=index.js.map