import fs from 'fs'
import yargs, { Options, string } from 'yargs'
import logging from '../../logging'
import { GetStatusFile, ReadStatusFromFile, ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import { GetExistingProjectsSync } from '../../config/projects.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'
import Colorizer from 'json-colorizer'
import * as List from './list'
import { clear } from 'console'

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
    help.Print('    <red>list, ls</red>                   list servers for active projects')
    help.Print('    <red>info</red>                       print the full information for servers of active projects')
    help.Print('    <red>summary</red>                    print the summarized information for servers of active projects')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('')
}