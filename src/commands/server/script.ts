import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging.js'
import { Status } from '../../config/status.js'
import { exit } from 'process'

let log = new logging("<TEMPLATE>")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export function ProcessCommand(args: string[]){
    log.Trace({script:args})
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
    help.Print('    <red>admiral server script</red> COMMAND [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Manage server scripts.')
    help.Print('')
    help.Print('COMMANDS:')
    help.Print("    <red>list, ls</red>                 list the available scripts")
    help.Print("    <red>run</red>                      run one or more of the available scripts")
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    --shared                 use the shared scripts instead of the server specific ones')
    help.Print('    --project                use project specific scripts instead of the server specific ones')
    help.Print('    -h, --help               print help')
    help.Print('')
}
