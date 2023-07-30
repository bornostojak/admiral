import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging.js'
import { Status } from '../../lib/status.js'
import { exit } from 'process'

let log = new logging("Project(Generate)")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export function ProcessCommand(args: string[]){
    log.Trace({project_generate:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    if(subcommand == 'help' || parsedArgs?.help || (parsedArgs?._.length == 1 && args.length == 1)){
        PrintHelp()
        exit(0)
    }
    let status = Status.Load()
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>admiral project generate</red> [OPTIONS] <cyan>RACK</cyan> <green>PROJECT_NAME</green>')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Automate the generation of a new project based on an existing rack.')
    help.Print('    You can see all available racks by running')
    help.Print('        <red>admiral rack ls</red>')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('    --production-only          skip the environment definition of staging.env and theater.env')
    help.Print('')
}
