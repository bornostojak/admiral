import fs from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { GetStatusFile, ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import { GetExistingProjectsSync } from '../../config/projects.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'

let log = new logging("List")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "unveil": {boolean: true, alias: 'u'},
    "show": {boolean: true, alias: 's'},
}

export function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    let status = ReadStatusFromFileSync()

    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }

    let servers = []
    for (let activeProject of status?.active) {
        let projectServersPath = path.join(GetLocalConfigLocation(), 'projects', activeProject, 'servers.json')
        if (!fs.existsSync(projectServersPath)) {
            log.Print(`<b>Project <red>${activeProject}</red> is missing the servers.json file.</b>`, true)
            continue
        }
        log.Log(`server.json found for ${activeProject}`)
        let activeProjectServer = JSON.parse(fs.readFileSync(projectServersPath).toString())
        if (!parsedArgs.unveil && !parsedArgs.show) {
            for (let server of activeProjectServer) {
                delete server.password
                delete server.username
            }
        }
        servers.push({[activeProject]: activeProjectServer})

    }
    log.Print(JSON.stringify(servers, null, 2))
    exit(0)
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>list servers</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    List the defined servers of active projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -s, --show')
    help.Print('    -u, --unveil      - reveal the username and password')
    help.Print('')
}
