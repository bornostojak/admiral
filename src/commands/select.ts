import fs, { stat } from 'fs'
import { GetStatusFileLocation, GetLocalConfigLocation, Locations } from '../config/manager'
import logging from '../logging'
import path from "path"
import { exit } from 'process'
import yargs, { fail, Options } from 'yargs'
import { GetProjectsFileSync } from "../config/projects"
import { kStringMaxLength } from 'buffer'

let log = new logging("Select command")
const DESELECT_SYMBOL = "^"
const DESELECT_REGEX = /^\^/

const SELECT_SYMBOL = "+"
const SELECT_REGEX = /^\+/

export const CommandOptions : Record<string, Options> = {
    "all": {boolean: true, alias: 'a'},
    "help": {boolean: true, alias: 'h'},
    "show": {boolean: true, alias: 's'},
    "deselect": {boolean: true, alias: 'd'},
}

function processProjectsString(projectsString:string) : string[] {
    if (!projectsString) return []
    log.Trace({projectsString})
    let projects : string[] = projectsString?.includes(SELECT_SYMBOL) ? readStatusFromFileSync()?.active ?? [] : []
    projects = [...projects, ...projectsString
        ?.split(',')
        .map(f => f === 'all' ? GetProjectsFileSync().map(p => p?.name) : f )
        .flat()
    ]
    return projects.filter((val, pos) => projects.indexOf(val) == pos 
        && !projectsString.includes(`${SELECT_SYMBOL}${val}`)
        && !projectsString.includes(`${DESELECT_SYMBOL}${val}`))
}

export function ProcessCommand(args: string[]) {
    log.Trace({args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._[0].toString()
    let projects : null|string|string[] = processProjectsString(parsedArgs?._[1]?.toString()) ?? null
    let select = projects.filter(p => !p.startsWith('^')).map(p => p.replace(SELECT_REGEX, '')) ?? []
    let deselect = select.length > 0 ? [] : projects?.filter(p => p.startsWith('^'))?.map(p => p.replace(DESELECT_REGEX, '')) ?? []
    let status = readStatusFromFileSync()
    
    log.Prefix("SELECTION").Trace({command, projectsString: parsedArgs?._[1]?.toString(), select, deselect, initialStatus: status})

    if (command == "select" && (deselect.length > 0 && select.length == 0)) {
        log.Debug("Force deselecting")
        command = 'deselect'
    }

    if (parsedArgs.help) {
        if (command === "deselect"){
            PrintHelpDeselect()
            exit(0)
        }
        PrintHelp()
        exit(0)
    }
    
    if (parsedArgs.show){
        if (status?.active?.length > 0) {
            log.Trace("Printing active projects")
            log.Print(`Active projects: <green>${status?.active?.join(", ")}</green>` )
            exit(0)
        }
        log.Print("<red>There are currently no active projects</red>" )
        exit(1)
    }
    if (parsedArgs.deselect || command === 'deselect'){
        log.Debug("Deselecting...")
        let completeDeselection = [... new Set([...select, ...deselect])]
        log.Trace({deselect: completeDeselection})
        DeselectSync(completeDeselection, status)
        exit(0)
    }
    
    if (parsedArgs.all) {
        log.Debug("Selecting all projects")
        select = GetProjectsFileSync().map(p => p?.name).filter(p => !deselect.includes(p))
        log.Trace({prjectsAfterSelectAll: projects})
    }

    if (select.length == 0) {
        promptForProjects()
        exit(0)
    }

    //SelectSync(projects.map(p => p.replace(/^\+/, '')).filter(p => !p.startsWith('-')))
    log.Debug("Selecting projects")
    log.Trace({select})
    SelectSync(select)
    if (deselect?.length > 0) {
        log.Debug("Entering deselect")
        log.Trace({deselect})
        DeselectSync(deselect)
    }
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

function validateSelection(projects:string[]) {
    log.Debug('Validating selection...')
    log.Trace({projects})
    try {
        let definedProjects = GetProjectsFileSync()
        if (!(definedProjects instanceof Array)) {
            log.Debug('<red>Validation FAILED.</red>')
            log.Error("Wrong syntax in <red>projects.json</red>!")
            exit(1)
        }
        let undefinedProjects = projects?.filter(project => !definedProjects.map(s => s['name']).includes(project)) 
        if (undefinedProjects?.length > 0) {
            log.Debug('<red>Validation FAILED.</red>')
            log.Log(`Undefined projects: <b><red>${undefinedProjects.join(", ")}</red></b>`)
            exit(1)
        }
    } catch (err) {
        log.Debug('<red>Validation FAILED.</red>')
        log.Error(`An error occurred during validation. Check the <b><red>projects.json</red></b> file in your local configs`)
        log.Trace({err})
        exit(1)
    }
    log.Debug('<green>Validation successful.</green>')
}


export async function updateStatusFile(status:any) {
    await fs.promises.writeFile(getStatusFile() ,JSON.stringify(status, null, 4))
}
export function updateStatusFileSync(status:any) {
    fs.writeFileSync(getStatusFile() ,JSON.stringify(status, null, 4))
}


export function DeselectSync(projects?:string[], status:any = readStatusFromFileSync()){
    log.Trace({status, project: projects})
    if (status?.active?.length === 0) {
        log.Log("No project is currently active, nothing to do")
        return
    }
    if (projects && projects.length > 0) {
        let active : string[] = status['active'] instanceof Array ? status.active : [status.active]
        projects.forEach(p => {
            if (!active.includes(p))
            log.Log(`Not active: <red>${p}</red>`)
        })

        let finalDeselection = active?.filter(a => projects.includes(a))
        if (finalDeselection?.length > 0) log.Log(`Deselecting projects: <blue>${finalDeselection.join(', ')}</blue>`)
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
        let status = JSON.parse(fileContent.toString())
        log.Trace({status})
        return status
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
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('  <red>mob select</red> [OPTIONS]')
    help.Print('  <red>mob select</red> PROJECT [OPTIONS]')
    help.Print('  <red>mob select</red> PROJECT1,PROJECT2,.. [OPTIONS]')
    //log.Print('')
    //log.Print('  special case:')
    help.Print('  <red>mob select</red> <b><green>all</green></b>,... [OPTIONS]')
    help.Print('    - select all projects')
    help.Print('  <red>mob select</red> <b><green>+PROJECT1</green></b>,<b><blue>^PROJECT2</blue></b>... [OPTIONS]')
    help.Print('    - add <green>PROJECT2</green> to the existing selection')
    help.Print('    - deselect or subtract <blue>PROJECT2</blue> from the selection')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('  Select one or multiple projects and designate them as <red>active</red>')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print(`  -a, --all         - select all available projects`)
    help.Print(`  -s, --show        - show the current active project`)
    help.Print(`  -d, --deselect    - deselect the currently active project`)
    help.Print(`  -h, --help        - print the help message`)
    help.Print('')
}
function PrintHelpDeselect(){
    let help = log.Prefix('Help')
    help.Print('USAGE:')
    help.Print('  <red>mob deselect</red> [OPTIONS]')
    help.Print('  <red>mob deselect</red> <PROJECT> [OPTIONS]')
    help.Print('  <red>mob deselect</red> <PROJECT1>,<PROJECT2>,.. [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('  Deselect specific projects or all projects.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print(`  -h, --help                          - print the help message`)
    help.Print('')
}


//TODO: special case
///SPECIAL CASE:
/*
mauricius on  main [!?] via  v18.5.0 ➜ mo select all                      
Projects selected: cws, meevu, eronet



mauricius on  main [!?] via  v18.5.0 ➜ mo deselect all,^cws,^meevu,^eronet
Deselected project: cws
Deselected project: meevu
Deselected project: eronet
*/