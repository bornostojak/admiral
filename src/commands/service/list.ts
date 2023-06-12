import fs from 'fs'
import { ConnectToDockerOverSSH } from '../../docker.js'
import yargs, { Options } from 'yargs'
import logging from '../../logging'
import { ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import path from 'path'
import Config, { GetLocalConfigLocation } from '../../config/manager.js'

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
    let status = ReadStatusFromFileSync()
    for (let activeProject of status.active) {
        let activeProjectServersFilePath = path.join(GetLocalConfigLocation(), "projects", activeProject, "servers.json")
        let localConfig = Config.GetLocalConfigSync()
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
                    host: first.address,
                    port: first.prot,
                    password: first.password
                }
            )
            let services = await docker.listServices()
            log.Print(services)
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
