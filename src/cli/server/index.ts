import fs from 'fs'
import yargs, { Options, string } from 'yargs'
import logging from '../../logging'
import { Status } from '../../lib/status'
import { exit } from 'process'
import path from 'path'
import Colorizer from 'json-colorizer'
import { clear } from 'console'

import * as List from './list'
import * as Add from './add'
import * as Script from './script'

let log = new logging("Server")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "unveil": {boolean: true, alias: 'u'},
    "show": {boolean: true, alias: 's'},
    "json": {boolean: true, alias: 'j'},
}

let definedSubcommands = [
    "list",
    "ls"
]
export async function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')

    if (subcommand == "list" || subcommand == "ls") {
        await List.ProcessCommand(args.slice(1))
        exit(0)
    }

    if (subcommand == "add" ) {
        await Add.ProcessCommand(args.slice(1))
        exit(0)
    }

    if (subcommand == "script" ) {
        await Script.ProcessCommand(args.slice(1))
        exit(0)
    }

    if(subcommand == 'help' || parsedArgs?.help || (command == "server" && args.length == 1) || (subcommand && !definedSubcommands.includes(subcommand))){
        PrintHelp()
        exit(0)
    }

    if (command != "server") {
        PrintHelp()
        exit(1)
    }

    PrintHelp()
    exit(0)
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>server</red> [OPTIONS] COMMANDS')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Manager servers associated with active projects.')
    help.Print('')
    help.Print('COMMANDS:')
    help.Print('    <red>add</red>                        print the summarized information for servers of active projects')
    help.Print('    <red>list, ls</red>                   list servers for active projects')
    help.Print('    <red>info</red>                       print the full information for servers of active projects')
    help.Print('    <red>summary</red>                    print the summarized information for servers of active projects')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('')
}