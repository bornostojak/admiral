import yargs, { Options, help, string } from 'yargs'
import logging from '../../logging'
import { Status } from '../../lib/status'
import { exit } from 'process'

import * as helpers from '../helpers/index'
import ProjectConfig from '../../lib/project'
import Server from '../../lib/server'

let log = new logging("Servers list")

export const CommandOptions : Record<string, Options> = {
    "help": { boolean: true, alias: 'h' },
    "unveil": { boolean: true, alias: 'u' },
    "extended": { boolean: true, alias: 'e' },
    "show": { boolean: true, alias: 's' },
    "json": { boolean: true, alias: 'j' },
    "table": { boolean: true, alias: 't' },
    "hostname": { boolean: true },
    "hostname-only": { boolean: true, alias: "H" },
}

export async function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    let status = Status.Load()

    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }

    let activeProjects = ProjectConfig.GetProjects().filter(p => status.Active.includes(p.Name))
    if (activeProjects.length == 0) {
        log.Print("<red><b>No projects are currently active.</b></red>")
        exit(1)
    }

    
    if (parsedArgs.table) {
        let projectServerInfo  = Object.fromEntries(activeProjects.map(p => {
            return [[p.Name], p.Servers.map(s => ExtendedOrReducedServerJSON(s, parsedArgs.extended as boolean))]
        }))
        log.Print(helpers.Json.toTableString(projectServerInfo))
        exit(0)
    }
    
    if (parsedArgs.json) {
        let projectServerInfo  = Object.fromEntries(activeProjects.map(p => {
            return [[p.Name], p.Servers.map(s => ExtendedOrReducedServerJSON(s, parsedArgs.extended as boolean))]
        }))
        log.Print(helpers.Json.ColorizedJSON(projectServerInfo))
        exit(0)
    }
    
    if (parsedArgs['hostname-only']) {
        for (let project of activeProjects) {
            for (let server of project.Servers) {
                log.Print(server.Hostname)
            }
        }
        exit(0)
    }
    
    if (parsedArgs.hostname) {
        activeProjects.map(p => {
            log.Print(helpers.Json.toIndentedStringify([{Servers: p.Servers.map(s => s.Hostname)}], {title: "Project", value: p.Name}))
        })
        exit(0)
    }
    
    activeProjects.map(p => {
        log.Print(helpers.Json.toIndentedStringify(p.Servers.map(s => ExtendedOrReducedServerJSON(s, parsedArgs.extended as boolean)), {title: "Project", value: p.Name}))
    })
    exit(0)

}

function ExtendedOrReducedServerJSON(server: Server, extended: boolean) {
    if (extended) {
        return server.toJSON()
    }
    return {
        Hostname: server.Hostname,
        IPv4: server.IPv4,
        IPv6: server.IPv6,
        SSHPort: server.SSHPort,
        Tags: server.Tags
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
    help.Print('    -e, --extended             list extended server information')
    help.Print('    -u, --unveil               reveal the username and password')
    help.Print('    -j, --json                 return in JSON format')
    help.Print('    -t, --table                print servers in table format')
    help.Print('    -h, --help                 print help')
    help.Print('    -hostname                  print server hostnames (indented)')
    help.Print('    -hostname-only             print only server hostnames (linear)')
    help.Print('')
}