import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../logging'
import { Status } from '../config/status'
import { exit } from 'process'

let log = new logging("Deploy")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({deploy_args: args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._[0].toString()
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    //let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
    let status = Status.Load()
    if (parsedArgs.help || subcommand == 'help') {
        PrintHelp()
        exit(0)
    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('  <red>mob deploy</red> [OPTIONS]')
    help.Print('  <red>mob deploy</red> SERVICE [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('  Deploy one or multiple services to the selected projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print(`  -h, --help        - print the help message`)
    help.Print('')
}