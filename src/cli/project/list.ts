import fs, { existsSync } from 'fs'
import yargs, { Options, string } from 'yargs'
import logging, { Formatting } from '../../logging'
import { Status } from '../../lib/status'
import { exit } from 'process'
import ProjectConfig, { ProjectStatus } from '../../lib/project/config.js'
import path from 'path'
import Colorizer from 'json-colorizer'

let log = new logging("Projects list")

import * as helpers from '../helpers/index'
import { toIndentedStringify } from '../helpers/json'
import { LocalConfig } from '../../lib'

export const LocalProjectDirectory = path.join(LocalConfig.Directory(), 'projects')

export const CommandOptions: Record<string, Options> = {
    "help": { boolean: true, alias: 'h' },
    "active": { boolean: true, alias: 'a' },
    "list": { boolean: true, alias: 'l' },
    "table": { boolean: true, alias: 't' },
    "json": { boolean: true, alias: 'j' },
    "status": { string: true }
}

function ProjectToJsonWithStatusInColor(project: ProjectConfig): { [key: string]: any } {
    let status = `${ProjectStatus[project.Status].slice(0, 1).toUpperCase() + ProjectStatus[project.Status].slice(1)}`
    switch (project.Status) {
        case ProjectStatus.active:
            status = `<green>${status}</green>`
            break
        case ProjectStatus.inactive: 
            status = `<red>${status}</red>`
            break
        case ProjectStatus.suspended:
            status = `<blue>${status}</blue>`
            break
        case ProjectStatus.initialized:
            status = `<yellow>${status}</yellow>`
            break
    }
    let json = project.toJSON()
    json.Status = status
    return json
}

export async function ProcessCommand(args: string[]) {
    log.Trace({ list_args: args })
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command: string = parsedArgs?._.slice(0, 1).join('')
    let subcommand: string = parsedArgs?._.slice(1, 2).join('')

    if (subcommand == 'help' || parsedArgs?.help) {
        PrintHelp()
        exit(0)
    }

    let status = Status.Load()
    let projects = ProjectConfig.GetProjects()

    if (projects.length == 0) {
        log.Print("<b>You don't have any projects defined yet.</b>")
        exit(1)
    }

    if (parsedArgs.active) {
        projects = projects.filter(p => status.Active.includes(p.Name))
    }

    if (projects.length == 0) {
        log.Print("No currently active projects")
        exit(0)
    }

    // filtering by status
    if (parsedArgs.status) {
        let validProjectStatusArray = Object.keys(ProjectStatus)
        validProjectStatusArray = validProjectStatusArray.slice(validProjectStatusArray.length / 2);
        let statusToFilterByArray = (parsedArgs.status as string).split(',')
        // if a filter is not defined in the valid filters, log and abort
        // so a filter other than
        // - suspended
        // - active
        // - inactive
        let invalidFilters = statusToFilterByArray.filter(f => !validProjectStatusArray.includes(f))
        if (invalidFilters.length > 0) {
            log.Error("The following are invalid project status filters:")
            log.Error(`  ${invalidFilters.map(f => `<red>${f}</red>`).join('\n  ')}`)
            exit(1)
        }
        projects = projects.filter(p => statusToFilterByArray.includes(ProjectStatus[p.Status]))
    }
    if (parsedArgs?.list) {
        projects.forEach(p => {
            log.Print(`${p.Name}`)
        })
        exit(-1)
    }
    if (!existsSync(`${ProjectConfig.Directory()}`)) {
        log.Error(`No <b>projects</b> location detected\nPlease generate a projects location at <cyan>"${ProjectConfig.Directory()}/projects"</cyan>`)
        exit(1)
    }
    if (parsedArgs.json) {
        log.Print(helpers.Json.ColorizedJSON(projects.map(p => p.toJSON())))
        exit(0)
    }
    if (parsedArgs.table) {
        log.Print(helpers.Json.toTableString(projects.map(p => ProjectToJsonWithStatusInColor(p))))
        exit(0)
    }

    let projectMaxNameLength = projects?.map(p => p.Name.length)?.sort()?.reverse()[0] ?? 0
    let projectStatusArray = projects.map(p => [`${p.Name}`+' '.repeat((projectMaxNameLength > p.Name.length ? projectMaxNameLength : p.Name.length)-p.Name.length+1) +`(${ProjectToJsonWithStatusInColor(p).Status})`, p.Environments.map(e => e.Name)])
    let statusesObject = Object.fromEntries(projectStatusArray)
    log.Print(toIndentedStringify([statusesObject], { title: "Projects" }))
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
    help.Print('    -l, --list                 only list project names, suitable for piping')
    help.Print('    -a, --active               list only active projects')
    help.Print('    --status                   list only project with the specified statuses, separated by a comma symbol (i.e. inactive,active)')
    help.Print('')
}