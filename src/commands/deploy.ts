import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../logging'
import { ReadStatusFromFileSync } from '../config/status'

let log = new logging("Deploy")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export function ProcessCommand(args: string[]){
    log.Trace({deploy_args: args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let service : string = parsedArgs?._[0].toString()
    //let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
    let status = ReadStatusFromFileSync()
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
