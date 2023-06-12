import fs from 'fs'
import yargs, { Options, string } from 'yargs'
import logging from '../../logging'
import { Status } from '../../config/status'
import { exit } from 'process'
import * as List from './list'
import * as Select from './select'
import * as Init from './init'

let log = new logging("Project")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "list": {boolean: true, alias: 'l'},
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

    switch (subcommand) {
        case "active":
        case "selected":
            await Select.ProcessCommand(['select', '-s', ...args.filter(f => f != 'select')])
            break
        case "init":
            await Init.ProcessCommand(args.slice(1))
            break;
        case "ls":
        case "list":
            await List.ProcessCommand(args.slice(1))
            break;
        case "deselect":
        case "select":
            await Select.ProcessCommand(args.slice(1))
            break;
    }

    if(subcommand == 'help' || parsedArgs?.help || (command == "project" && args.length == 1) || (subcommand) && !definedSubcommands.includes(subcommand)){
        PrintHelp()
        exit(0)
    }

    if (command != "project") {
        PrintHelp()
        exit(1)
    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>project</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Manager active projects.')
    help.Print('')
    help.Print('COMMANDS:')
    help.Print('    <red>active, selected</red>           list active projects')
    help.Print('    <red>deselect</red>                   deselect one or more projects')
    help.Print('    <red>init</red>                       initiate an empty new project')
    help.Print('    <red>list, ls</red>                   list existing projects')
    help.Print('    <red>select</red>                     select one or more projects')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('')
}