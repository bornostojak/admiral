#!/usr/bin/env node
import bindRemoteSocketAsync from '../connections/sockets.js' 
import {unlinkSync} from "fs"
import {exit, argv} from 'process'
import logging from '../logging.js'
import ParseArgs from '../config/args.js'
import yargs from 'yargs/yargs'
import yargsParsed, { Options, Argv } from 'yargs'
import ProcessArguments, { PrintHelp } from './index.js' 

let log = new logging("Admiral")


let argsUnparsed = argv.slice(2)
let command = yargsParsed.help(false).argv._.slice(0,1).join('')
let mobArgsUnparsed = command === '' ? argsUnparsed : argsUnparsed.slice(0, argsUnparsed.indexOf(command))
ProcessMainArgs(mobArgsUnparsed, command === '')
//console.log(JSON.stringify({mobArgs}, null, 4))



let commandArgsUnparsed = command === '' ? [] : argsUnparsed.slice(argsUnparsed.indexOf(command))
ProcessArguments(commandArgsUnparsed)

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

process.on("SIGINT", () => exit(1))

function ProcessMainArgs(args: string[], noCommandDefined:boolean) {
    let yargsMainOptions : {[key: string]: Options;}= {
        help: {
            type: 'boolean',
            alias: 'h'
        },
    }
    let mobArgs = yargs(args).help(false).options(yargsMainOptions).argv
    // if there is no other arguments
    if (noCommandDefined && Object.entries(mobArgs).filter(([k,v]) => !['$0', '_'].includes(k)).length == 0){
        PrintHelp()
    }
    if (mobArgs['help']) {
        PrintHelp()
    }
    
}
