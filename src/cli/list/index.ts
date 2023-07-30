import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { Status } from '../../lib/status'
import { exit } from 'process'

let log = new logging("List")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "list": {boolean: true, alias: 'l'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    let status = Status.Load()

    if(subcommand == 'help' || parsedArgs?.help || (command == "list" && args.length == 1)){
        PrintHelp()
        exit(0)
    }

    if (command != 'list'){
        log.Print("<b>Wrong arguments passed to <red>list</red> command!</b>")
        exit(1)
    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>list</red> [OPTIONS] COMMAND')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    <red>list</red> additional information.')
    help.Print('')
    help.Print('COMMANDS:')
    help.Print('    <red>projects</red>       - list projects')
    help.Print('    <red>servers</red>        - list servers')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                - print help')
    help.Print('')
}
