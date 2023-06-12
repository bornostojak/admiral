import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { exit } from 'process'

import * as List from './list'
import * as Versions from './versions'

let log = new logging("Service")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({service_args: args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    
    switch (subcommand) {
        case "ls":
        case "list":
            await List.ProcessCommand(args.slice(1))
            break
        case "versions":
            await Versions.ProcessCommand(args.slice(1))
    }

    if(subcommand == 'help' || parsedArgs?.help || (parsedArgs?._.length == 1 && args.length == 1)){
        PrintHelp()
        exit(0)
    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('')
}
