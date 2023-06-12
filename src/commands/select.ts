import fs, { stat } from 'fs'
import { GetStatusFileLocation, GetLocalConfigLocation, Locations } from '../config/manager'
import logging from '../logging'
import path from "path"
import { exit } from 'process'
import yargs, { fail, Options } from 'yargs'

let log = new logging("Select command")

export const CommandOptions : Record<string, Options> = {
    "all": {boolean: true, alias: 'a'},
    "help": {boolean: true, alias: 'h'},
    "show": {boolean: true, alias: 's'},
    "deselect": {boolean: true, alias: 'd'},
}

export function ProcessCommand(args: string[]) {
    log.Trace({args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._[0].toString()
    let projects : null|string|string[] = parsedArgs?._[1]?.toString().split(',') ?? null
    log.Trace({command, project: projects})

    let status = readStatusFromFileSync()
    if (parsedArgs.help) {
        if (command === "deselect"){
            PrintHelpDeselect()
            exit(0)
        }
        PrintHelp()
        exit(0)
    }
    if (parsedArgs.deselect || command === 'deselect'){
        DeselectSync(status, projects)
        exit(0)
    }
    
    if (parsedArgs.show){
        if (status?.active?.length > 0) {
            log.Print(`Active projects: <green>${status?.active?.join(", ")}</green>` )
            exit(0)
        }
        log.Print("<red>There are currently no active projects</red>" )
        exit(1)
    }
    
    if (parsedArgs.all) {
        log.Debug("Selecting all projects")
        projects = getProjectsFileSync().map(p => p?.name)
    }

    if (projects == null) {
        promptForProjects()
        exit(0)
    }

    SelectSync(projects)
    exit(0)
}

export function SelectSync(projects:string[], status = readStatusFromFileSync()) {
    validateSelection(projects)
    status['active'] = projects
    updateStatusFileSync(status)
    log.Print(`Projects selected: <green>${projects.join(', ')}</green>`)
    //log.Log(`Project set to <blue>${projects}</blue>`)

}

/**
 * Prompt the user to select a project from all existing projects
 */
function promptForProjects(){
    log.Debug("Going into project selection prompt")
    //TODO: prompt for existing projects
}

function getProjectsFileSync() {
    let configsPath = GetLocalConfigLocation()
    let dirs = fs.readdirSync(configsPath)
    if (!dirs.includes('projects.json')){
        log.Error("The local config folder doesn't include a <red>projects.json</red> file!")
        //TODO: explain how to get a projects.json file
        exit(1)
    }
    let projectsFilePath = path.join(configsPath, "projects.json")
    try {
        let projectsFileContent = fs.readFileSync(projectsFilePath).toString()
        let definedProjects : Array<Record<string, any>> = JSON.parse(projectsFileContent)
        log.Trace({projectsFileContent})
        return definedProjects
    } catch (err) {
        log.Error(`An error occurred whilst parsing <b><red>${projectsFilePath}</red></b>`)
        log.Trace({err})
        exit(1)
    }
}
function validateSelection(projects:string[]) {
    try {
        let definedProjects = getProjectsFileSync()
        if (!(definedProjects instanceof Array)) {
            log.Error("Wrong syntax in <red>projects.json</red>!")
            exit(1)
        }
        let undefinedProjects = projects?.filter(project => !definedProjects.map(s => s['name']).includes(project)) 
        if (undefinedProjects?.length > 0) {
            log.Log(`Undefined projects: <b><red>${undefinedProjects.join(", ")}</red></b>`)
            exit(1)
        }
    } catch (err) {
        log.Error(`An error occurred during validation. Check the <b><red>projects.json</red></b> file in your local configs`)
        log.Trace({err})
        exit(1)
    }
}


export async function updateStatusFile(status:any) {
    await fs.promises.writeFile(getStatusFile() ,JSON.stringify(status, null, 4))
}
export function updateStatusFileSync(status:any) {
    fs.writeFileSync(getStatusFile() ,JSON.stringify(status, null, 4))
}


export function DeselectSync(status:any = readStatusFromFileSync(), projects?:string[]){
    log.Trace({status, project: projects})
    if (status?.active?.length === 0) {
        log.Log("No project is currently active, nothing to do")
        return
    }
    if (projects) {
        let active : string[] = status['active'] instanceof Array ? status.active : [status.active]
        projects.forEach(p => {
            if (!active.includes(p))
            log.Log(`Not active: <red>${p}</red>`)
        })

        active.forEach(p => {
            if (projects.includes(p))
                log.Log(`Deselected project: <blue>${p}</blue>`)
        })
        status.active = active.filter(p => !projects.includes(p))
        updateStatusFileSync(status)
        return
    }
    status['active'] = []
    updateStatusFileSync(status)
    log.Log('All projects have been deselected')
}



export async function readStatusFromFile() {
    let statusFile = getStatusFile()
    let fileContent = await fs.promises.readFile(statusFile)
    try {
        return JSON.parse(fileContent.toString())
    } catch(err) {
        log.Error(`The file <red>${statusFile}</red> could not be properly parsed`)
        exit(1)
    }

}
export function readStatusFromFileSync() {
    let statusFile = getStatusFile()
    let fileContent = fs.readFileSync(statusFile)
    try {
        return JSON.parse(fileContent.toString())
    } catch(err) {
        log.Error(`The file <red>${statusFile}</red> could not be properly parsed`)
        exit(1)
    }
}

function getStatusFile() {
    let statusFile = GetStatusFileLocation()
    if (statusFile === null) {
        log.Error("The status file could not be located.\nSelect one of the following locations and there configure a <red>status.json</red> file:\n\n")
        log.Error(Locations?.local)
        exit(1)
    }
    return statusFile
}


function PrintHelp() {
    log.Print('USAGE:')
    log.Print('  <red>mob select</red> [OPTIONS]')
    log.Print('  <red>mob select</red> <PROJECT> [OPTIONS]')
    log.Print('  <red>mob select</red> <PROJECT1>,<PROJECT2>,.. [OPTIONS]')
    log.Print('')
    log.Print('DESCRIPTION:')
    log.Print('  Select one or multiple projects and designate them as <red>active</red>')
    log.Print('')
    log.Print('OPTIONS:')
    log.Print(`  -a, --all                           - select all available projects`)
    log.Print(`  -s, --show                          - show the current active project`)
    log.Print(`  -d, --deselect                      - deselect the currently active project`)
    log.Print(`  -h, --help                          - print the help message`)
    log.Print('')
}
function PrintHelpDeselect(){
    log.Print('USAGE:')
    log.Print('  <red>mob deselect</red> [OPTIONS]')
    log.Print('  <red>mob deselect</red> <PROJECT> [OPTIONS]')
    log.Print('  <red>mob deselect</red> <PROJECT1>,<PROJECT2>,.. [OPTIONS]')
    log.Print('')
    log.Print('DESCRIPTION:')
    log.Print('  Deselect specific projects or all projects.')
    log.Print('')
    log.Print('OPTIONS:')
    log.Print(`  -h, --help                          - print the help message`)
    log.Print('')
}
