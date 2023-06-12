import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { GetStatusFile, ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import { GetExistingProjectsSync } from '../../config/projects.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'
import * as Servers from './servers'

let log = new logging("List")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "list": {boolean: true, alias: 'l'},
}

export function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    let status = ReadStatusFromFileSync()

    if (subcommand == "servers") {
        Servers.ProcessCommand(args.slice(1))
        exit(0)
    }

    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }

    if (command != 'list'){
        log.Print("<b>Wrong arguments passed to <red>list</red> command!</b>")
        exit(1)
    }
    let projects = GetExistingProjectsSync()
    if (parsedArgs?.list) {
        projects.map(d => d?.name).forEach(p => {
            log.Print(`<cyan>${p}</cyan>`)
        })
        exit(0)
    }
    log.Print(['Existing projects: ', ...projects.map(f => `<cyan>${f?.name}</cyan>`)].join('\n  '))
    //log.Print(`${projects}`)
    //let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>list</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    <red>list</red> all existing projects')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -l, --list        - print out existing projects line-by-line')
    help.Print('    -u, --unveil      - reveal the username and password')
    help.Print('')
}
