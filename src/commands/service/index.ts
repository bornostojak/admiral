import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { ReadStatusFromFileSync } from '../../config/status'
import * as configManager from '../../config/manager'
import * as projectsConfig from '../../config/projects'
import { exit } from 'process'

import * as List from './list'

let log = new logging("Service")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({service_args: args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    
    if (subcommand == "ls" || subcommand == "list") {
        await List.ProcessCommand(args.slice(1))
        exit(0)
    }

    if(subcommand == 'help' || parsedArgs?.help || (parsedArgs?._.length == 1 && args.length == 1)){
        PrintHelp()
        exit(0)
    }
    let status = ReadStatusFromFileSync()
    let projects = projectsConfig.GetExistingProjectsSync()
    log.Print(projects.map(d => d.name).join('\n'))

    //let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
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
