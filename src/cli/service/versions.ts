import fs from 'fs'
import { ConnectToDockerOverSSH } from '../../docker.js'
import yargs, { Options, version } from 'yargs'
import logging from '../../logging'
import { Status } from '../../lib/status.js'
import { exit } from 'process'
import path from 'path'
import {ContainerTaskSpec, TaskSpec} from 'dockerode'
import LocalConfig from '../../lib/localConfig.js'

let log = new logging("Service List")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({service_list:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')
    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }
    let status = Status.Load()
    for (let activeProject of status.Active) {
        let activeProjectServersFilePath = path.join(LocalConfig.Directory(), "projects", activeProject, "servers.json")
        if (!fs.existsSync(activeProjectServersFilePath)) {
            log.Print(`No "servers.json" file exists for project <red>${activeProject}</red>`)
            continue
        }
        let serversFile = JSON.parse(fs.readFileSync(activeProjectServersFilePath).toString())
        let first = serversFile[0]
        log.Print(`Project <b><red>${activeProject}</red></b>:`)
        try {
            let docker = await ConnectToDockerOverSSH(
                {
                    username: first.username,
                    host: first.host,
                    port: first.prot,
                    password: first.password
                }
            )
            let services = await docker.listServices()
            log.Print(JSON.stringify(services.map(s => ({[String(s.Spec?.Name)]: {
                image: (<ContainerTaskSpec>s.Spec?.TaskTemplate).ContainerSpec?.Image?.split(':')[0],
                version: (<ContainerTaskSpec>s.Spec?.TaskTemplate).ContainerSpec?.Image?.replace(/[^:]*:([^@]+).*/, "$1"),
            }})), null, 2))
            // log.Print(services.map(s => s.ServiceStatus).join('\n  ').replace(/^/g, '  '))
            // log.Print()
        }
        catch(err) {
            log.Error(err)
        }
        exit(0)


    }
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
