import fs, { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import yargs, { Options } from 'yargs'
import logging, { Formatting } from '../../logging.js'
import { Status } from '../../lib/status.js'
import { exit } from 'process'
import { ColorizedJSON } from '../helpers/json.js'
import Server, { IServer } from '../../lib/server.js'
import readline from 'readline';
import ProjectConfig from '../../lib/project/config.js'
import path from 'path'
import yaml from 'js-yaml'

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let log = new logging("<TEMPLATE>")

export const CommandOptions: Record<string, Options> = {
    "help": { boolean: true, alias: 'h' },
    "template": { boolean: true, alias: 't' },
    "number": { number: true, alias: 'n', default: 1 },
}

interface ServerExtended extends IServer {
    Name: string
}
interface AddedServers {
    [key: string]: ServerExtended[]
}

export function ProcessCommand(args: string[]) {
    log.Trace({ server_add: args })
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command: string = parsedArgs?._.slice(0, 1).join('')
    let subcommand: string = parsedArgs?._.slice(1, 2).join('')
    let status = Status.Load()

    if ((parsedArgs.number as number) <= 0) {
        log.Error(`Incorrect "number" argument <red>"${parsedArgs.number}"</red>: must be greater than 0`)
        exit(1)
    }

    if (!process.stdin.isTTY) {
        try {
            let addedServers: AddedServers = JSON.parse(readFileSync(0, 'utf-8').toString())
            for (let [projectName, newServers] of Object.entries(addedServers)) {
                if (!ProjectConfig.ListProjectNames().includes(projectName)) {
                    log.Error(`The project <red><b>${projectName}</b></red> doesn't exists. Please init the project using\n\t<red><i>admiral project init ${projectName}</i></red>`)
                    exit(1)
                }
                // i'll skip this for now, need to figure out a prompt that
                // allows skipping by default if the project is not active
                /*
                * if (!status.Active.includes(projectName)) {
                *     let result = "N"
                *     rl.question(Formatting(`The project <red><b>${projectName}</b></red> is not active, proceed anyway? [y/N]:`), (res) => {
                *         result = res.toLocaleLowerCase()
                *     })
                *     if (result !== 'y') {
                *         log.Debug(log.Print(Formatting(`Project <red><b>${projectName}</b></red> skipped!`)))
                *         continue
                *     }
                * }
                */

                let projectPath = path.join(ProjectConfig.Directory(), projectName)
                for (let server of newServers) {
                    let serverDirName = path.join(projectPath, "servers", server.Name)
                    if (existsSync(serverDirName)) {
                        log.Error(`The server <red><b>${projectName}/${server.Name}</b></red> you're trying to define already exists!`)
                        exit(1)
                    }
                    mkdirSync(serverDirName, { recursive: true })
                    let serverFile = Server.fromJSON(server)
                    // TODO: move this save operation to the Server class
                    // writeFileSync(path.join(serverDirName, "server.json"), JSON.stringify(serverFile.toJSON(), null, 4), { flag: "w+" })
                    writeFileSync(path.join(serverDirName, "server.yaml"), yaml.dump(serverFile.toYAML(), { indent: 2 }), { flag: "w+" })
                    log.Log(log.Print(`Successfully added server <green><b>${projectName}/${server.Name}</b></green>.`))
                }

            }
            exit(0)
        } catch (err) {
            log.Error("An error occurred during the process of parsing the new server data:")
            log.Error((err as Error).message)
            exit(1)
        }
    }

    if (subcommand == 'help' || parsedArgs?.help || (parsedArgs?._.length == 1 && args.length == 1)) {
        PrintHelp()
        exit(0)
    }


    if (parsedArgs.template) {
        let serverTemplates = Object.fromEntries(status.Active.map(p => [p, [...Array(parsedArgs.number as number)].map(_ => ({ Name: "", ...(new Server()).toJSON() }))]))
        log.Print(ColorizedJSON(serverTemplates))
        exit(0)
    }

    for (let activeProject of status.Active) {

    }
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>admiral server add</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Add additional servers to the currently selected projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('    -t, --template             generate a template for each of the currently active servers')
    help.Print('    -n, --number               generate a "n" number of servers templates for each project')
    help.Print('')
}
