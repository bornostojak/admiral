import fs, { existsSync } from 'fs'
import yargs, { Options, string } from 'yargs'
import logging, { Formatting } from '../../logging'
import { GetStatusFile, ReadStatusFromFile, ReadStatusFromFileSync } from '../../config/status'
import { exit } from 'process'
import { GetExistingProjects, GetExistingProjectsSync } from '../../config/projects.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'
import Colorizer from 'json-colorizer'

let log = new logging("Projects list")

import * as helpers from '../helpers/index'

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "list": {boolean: true, alias: 'l'},
}

export async function ProcessCommand(args: string[]){
    log.Trace({list_args:args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._.slice(0,1).join('')
    let subcommand : string = parsedArgs?._.slice(1,2).join('')

    if(subcommand == 'help' || parsedArgs?.help){
        PrintHelp()
        exit(0)
    }


    let projects = await GetExistingProjects()
    if (parsedArgs?.list) {
        projects.map(d => d?.name).forEach(p => {
            log.Print(`${p}`)
        })
        exit(0)
    }
    // log.Print(['Existing projects: ', ...projects.map(f => `<cyan>${f?.name}</cyan>`)].join('\n  '))
    let localConfigLocation = GetLocalConfigLocation()
    let currentStatus = GetStatusFile()
    if (!existsSync(`${localConfigLocation}/projects`)) {
        log.Error(`No <b>projects</b> location detected\nPlease generate a projects location at <cyan>"${localConfigLocation}/projects"</cyan>`)
        exit(1)
    }
    let projectStatusInfo : Record<string, string> = {}
    for (let projectName of projects.map(p => p.name)) {
        let projectInfoPath = `${localConfigLocation}/projects/${projectName}/project.json`
        if (!existsSync(projectInfoPath)) {
        }
        try {
            let projectInfo = JSON.parse(fs.readFileSync(projectInfoPath).toString())
            if (projectInfo["active"].toString() === "true") {
                projectStatusInfo[projectName] = Formatting("<green><b>Active</b></green>")
                // if (currentStatus.Active.includes(projectName)) {
                //     projectStatusInfo[projectName] += ' <green><b> (Selected)</b></green>'
                // }
                continue
            }
            projectStatusInfo[projectName] = Formatting("<red><b>Inactive</b></red>")
        }
        catch {
            projectStatusInfo[projectName] = Formatting("<red><b>Inactive</b></red>")
            continue
        }
    }
    // log.Print(helpers.Json.IndentedStringify(Object.fromEntries(projects.map(f => [f.name, '<green>Active</green>'])), {title: "Projects"}))
    log.Print(helpers.Json.IndentedStringify(projectStatusInfo, {title: "Projects"}))

}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('    <red>project list</red> [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    List all defined projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('    -l, --list                 list only the existing projects')
    help.Print('')
}