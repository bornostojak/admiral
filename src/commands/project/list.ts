import fs, { existsSync } from 'fs'
import yargs, { Options, string } from 'yargs'
import logging, { Formatting } from '../../logging'
import { Status } from '../../config/status'
import { exit } from 'process'
import ProjectConfig, { ProjectStatus } from '../../config/project.js'
import { GetLocalConfigLocation } from '../../config/manager.js'
import path from 'path'
import Colorizer from 'json-colorizer'

let log = new logging("Projects list")

import * as helpers from '../helpers/index'
import { toIndentedStringify } from '../helpers/json'

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
    "list": {boolean: true, alias: 'l'},
    "table": {boolean: true, alias: 't'},
    "json": {boolean: true, alias: 'j'},
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

    let projectNameArray = ProjectConfig.ListProjectNames()
    if (parsedArgs?.list) {
        projectNameArray.forEach(p => {
            log.Print(`${p}`)
        })
        exit(0)
    }
    // log.Print(['Existing projects: ', ...projects.map(f => `<cyan>${f?.name}</cyan>`)].join('\n  '))
    let localConfigLocation = GetLocalConfigLocation()
    let currentStatus = Status.Path()
    if (!existsSync(`${localConfigLocation}/projects`)) {
        log.Error(`No <b>projects</b> location detected\nPlease generate a projects location at <cyan>"${localConfigLocation}/projects"</cyan>`)
        exit(1)
    }
    let projectStatusInfo : Record<string, string> = {}
    if (parsedArgs.json) {
        log.Print(helpers.Json.ColorizedJSON(projectNameArray
            .map(p => ProjectConfig.LoadByName(p))
            .filter(p => p !== null)
            .map(p => (p as ProjectConfig).toJSON())))
        exit(0)
    }
    if (parsedArgs.table) {
        log.Print(helpers.Json.toTableString(projectNameArray
            .map(p => ProjectConfig.LoadByName(p))
            .filter(p => p !== null)
            .map(p => (p as ProjectConfig).toJSON())))
        exit(0)
    }

    let projectConfigArray = ProjectConfig.GetProjects()
    let projectStatusArray = projectConfigArray.map(p => {
        switch(p.Status) {
            case ProjectStatus.active:    return [p.Name, `<green>${ProjectStatus[p.Status].slice(0,1).toUpperCase()+ProjectStatus[p.Status].slice(1)}</green>`]
            case ProjectStatus.inactive:  return [p.Name, `<red>${ProjectStatus[p.Status].slice(0,1).toUpperCase()+ProjectStatus[p.Status].slice(1)}</red>`]
            case ProjectStatus.suspended: return [p.Name, `<blue>${ProjectStatus[p.Status].slice(0,1).toUpperCase()+ProjectStatus[p.Status].slice(1)}</blue>`]

        }
    })
    let statusesObject = Object.fromEntries(projectStatusArray)
    log.Print(toIndentedStringify([statusesObject], {title: "Projects"}))
    exit(0)
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