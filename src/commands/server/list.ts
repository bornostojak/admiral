import fs from 'fs'
import yargs, { Options, string } from 'yargs'
import logging from '../../logging'
import { GetStatusFile, ReadStatusFromFile, ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import { GetExistingProjectsSync } from '../../config/projects.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'

import * as helpers from '../helpers/index'

let log = new logging("Servers list")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "unveil": {boolean: true, alias: 'u'},
    "show": {boolean: true, alias: 's'},
    "json": {boolean: true, alias: 'j'},
    "table": {boolean: true, alias: 't'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    let status = await ReadStatusFromFile()

    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }

    let servers = []
    if (status?.active?.length < 1) {
        log.Debug("No active projects")
        log.Trace({status})
        log.Print("<b><red>No active projects detected!</red></b>")
        exit(0)
    }
    for (let activeProject of status?.active) {
        let projectServersPath = path.join(GetLocalConfigLocation(), 'projects', activeProject, 'servers.json')
        if (!fs.existsSync(projectServersPath)) {
            log.Print(`<b>Project <red>${activeProject}</red> is missing the servers.json file.</b>`, true)
            continue
        }
        log.Log(`server.json found for ${activeProject}`)
        let activeProjectServer = JSON.parse((await fs.promises.readFile(projectServersPath)).toString())
        if (!parsedArgs.unveil && !parsedArgs.show) {
            for (let server of activeProjectServer) {
                delete server.password
                delete server.username
            }
        }
        servers.push({[activeProject]: activeProjectServer})
    }
    log.Trace({listed_servers: servers})
    if (parsedArgs.json) {
        log.Print(helpers.Json.Colorized(servers.reduce((acc, cur) => {
            let key = Object.keys(cur)[0]
            acc[key] = cur[key]
            return acc
        })), true)
        exit(0)
    }
    if (parsedArgs.table) {
        log.Print(helpers.Json.TableString(servers))
        exit(0)
    }
    for (let project of servers) {
        let projectName = Object.keys(project)[0].toString()
        //log.Print(`<b>====== Project: <cyan>${projectName}</cyan> ======</b>`)
        log.Print(`<b>Project: <cyan>${projectName}</cyan></b>`)
        let max = 0
        project[projectName].forEach((srv:object) => Object.keys(srv).forEach(s => max = max >= s.toString().length ? max : s.toString().length))
        for (let projectServer of project[projectName]) {
            Object.keys(projectServer).forEach(s => max = max >= s.length ? max : s.length)
            Object.entries(projectServer).forEach(([key, val])=> {
                if (val instanceof Array) {
                    val = val.join(', ')
                }
                else if (val instanceof Object) {
                    val = JSON.stringify(val)
                }
                log.Print(`  <b><cyan>${key.charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}</cyan></b>:${'.'.repeat(2+max - key.toString().length)} ${String(val)}`)
            })
            log.Print('')
        }
        //log.Print(`<b>================${"=".repeat(projectName.length)}=======</b>`)
    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>server list</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    List the defined servers of the active projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -s, --show')
    help.Print('    -u, --unveil               reveal the username and password')
    help.Print('    -j, --json                 return in JSON format')
    help.Print('    -t, --table                print servers in table format')
    help.Print('    -h, --help                 print help')
    help.Print('')
}