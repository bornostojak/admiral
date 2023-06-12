import fs, { stat } from 'fs'
import logging from '../logging'
import { exit } from 'process'
import yargs, { Options } from 'yargs'
import { ProjectConfig } from "../config/projects"
import { Status } from "../config/status"

let log = new logging("Select command")
const DESELECT_SYMBOL = "^"
const DESELECT_REGEX = /^\^/

const SELECT_SYMBOL = "+"
const SELECT_REGEX = /^\+/

export const CommandOptions : Record<string, Options> = {
    "all": {boolean: true, alias: 'a'},
    "help": {boolean: true, alias: 'h'},
    "active": {boolean: true, alias: 'a'},
    "deselect": {boolean: true, alias: 'd'},
    "line": {boolean: true, alias: 'l'},
}


export async function ProcessCommand(args: string[]) {
    log.Trace({select_args: args})
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command : string = parsedArgs?._[0].toString()
    let projects : null|string|string[] = await processProjectsString(parsedArgs?._.slice(1).join(',')?.toString()) ?? null
    let select = projects.filter(p => !p.startsWith('^')).map(p => p.replace(SELECT_REGEX, '')) ?? []
    let deselect = select.length > 0 ? [] : projects?.filter(p => p.startsWith('^'))?.map(p => p.replace(DESELECT_REGEX, '')) ?? []
    let status = Status.Load()
    
    log.Prefix("SELECTION").Trace({command, projectsString: parsedArgs?._[1]?.toString(), select, deselect, initialStatus: status})

    if (command == "select" && (deselect.length > 0 && select.length == 0)) {
        log.Debug("Force deselecting")
        command = 'deselect'
    }

    if (parsedArgs.help  || args.length == 1) {
        if (command === "deselect" || args[0] == "deselect"){
            PrintHelpDeselect()
            exit(0)
        }
        if (command === "select" || args[0] === "select") {
            PrintHelp()
            exit(0)
        }
    }
    
    if (parsedArgs.active){
        if (status?.Active?.length > 0) {
            log.Trace("Printing active projects")
            if (parsedArgs?.line) {
                log.Print(`${status?.Active?.map(a => `<green>${a.toString()}</green>`).join("\n")}` )
                exit(0)
            }
            log.Print(`Active projects: <green>${status?.Active?.join(", ")}</green>` )
            exit(0)
        }
        log.Print("<red>There are currently no active projects</red>" )
        exit(1)
    }

    if (parsedArgs.deselect || command === 'deselect'){
        log.Debug("Deselecting...")
        let completeDeselection = [... new Set([...select, ...deselect])].filter(p => status?.Active?.includes(p))
        log.Trace({deselect: completeDeselection})
        await Deselect(completeDeselection, status)
        exit(0)
    }
    
    if (parsedArgs.all) {
        log.Debug("Selecting all projects")
        //select = GetProjectsFileSync().map(p => p?.name).filter(p => !deselect.includes(p))
        select = ProjectConfig.List().filter(p => !deselect.includes(p))
        log.Trace({projectsAfterSelectAll: projects})
    }

    if (select.length == 0) {
        await promptForProjects()
        exit(0)
    }

    log.Debug("Selecting projects")
    log.Trace({select})
    await Select(select)
    if (deselect?.length > 0) {
        log.Debug("Entering deselect")
        log.Trace({deselect})
        await Deselect(deselect)
    }
    exit(0)
}

async function processProjectsString(projectsString:string) : Promise<string[]> {
    if (!projectsString) return []
    log.Trace({projectsString})
    let projects : string[] = projectsString?.includes(SELECT_SYMBOL) ? Status.Load()?.Active ?? [] : []
    let existingProjects = ProjectConfig.List()
    projects = [...projects, ...projectsString
        ?.split(',')
        .map(f => f === 'all' ? existingProjects : f )
        .flat()
    ]
    return projects.filter((val, pos) => projects.indexOf(val) == pos 
        && !projectsString.includes(`${SELECT_SYMBOL}${val}`)
        && !projectsString.includes(`${DESELECT_SYMBOL}${val}`))
}

export async function Select(projects:string[], status? : Status) {
    if (!status) {
        status = Status.Load()
    }
    await validateSelection(projects)
    status.Active = projects
    Status.Save(status)
    log.Print(`Projects selected: <green>${projects.join(', ')}</green>`)
}

/**
 * Prompt the user to select a project from all existing projects
 */
async function promptForProjects(){
    log.Debug("Going into project selection prompt")
    //TODO: prompt for existing projects
}

async function validateSelection(projects:string[]) {
    log.Debug('Validating selection...')
    log.Trace({projects})
    try {
        let definedProjects = ProjectConfig.List()
        if (!(definedProjects instanceof Array)) {
            log.Debug('<red>Validation FAILED.</red>')
            log.Error("Wrong syntax in <red>projects.json</red>!")
            exit(1)
        }
        let undefinedProjects = projects?.filter(project => !definedProjects.includes(project)) 
        if (undefinedProjects?.length > 0) {
            log.Debug('<red>Validation FAILED.</red>')
            log.Print(`Undefined projects: <b><red>${undefinedProjects.join(", ")}</red></b>`, true)
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



export function DeselectSync(projects?:string[], status:Status = Status.Load()){
    log.Trace({status, project: projects})
    if (status?.Active?.length === 0) {
        log.Print("No project is currently active, nothing to do", true)
        return
    }
    if (projects && projects.length > 0) {
        let active : string[] = status.Active instanceof Array ? status.Active : [status.Active]
        projects.forEach(p => {
            if (!active.includes(p))
            log.Print(`Not active: <red>${p}</red>`, true)
        })

        let finalDeselection = active?.filter(a => projects.includes(a))
        if (finalDeselection?.length > 0) log.Print(`Deselecting projects: <blue>${finalDeselection.join(', ')}</blue>`, true)
        status.Active = active.filter(p => !projects.includes(p))
        Status.Save(status)
        return
    }
    status.Active = []
    Status.Save(status)
    log.Print('All projects have been deselected', true)
}

export async function Deselect(projects?:string[], status:Status = Status.Load()){
    log.Trace({status, project: projects})
    if (status?.Active?.length === 0) {
        log.Print("No project is currently active, nothing to do", true)
        return
    }
    if (projects && projects.length > 0) {
        let active : string[] = status.Active instanceof Array ? status.Active : [status.Active]
        projects.forEach(p => {
            if (!active.includes(p))
            log.Print(`Not active: <red>${p}</red>`, true)
        })

        let finalDeselection = active?.filter(a => projects.includes(a))
        if (finalDeselection?.length > 0) log.Print(`Deselecting projects: <blue>${finalDeselection.join(', ')}</blue>`, true)
        status.Active = active.filter(p => !projects.includes(p))
        Status.Save(status)
        return
    }
    status.Active = []
    Status.Save(status)
    log.Print('All projects have been deselected', true)
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
    help.Print('  <red>mob select</red> <b><green>+PROJECT1</green></b>,<b><blue>^PROJECT2</blue></b>... [OPTIONS]')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('  Select one or multiple projects and designate them as <red>active</red>')
    help.Print('  All projects can be selected using the <b><green>all</green></b> keyword.')
    help.Print('  Adding <b><green>+</green></b> in front of the project name will <green>add</green> it to the selection.')
    help.Print('  Adding <b><blue>^</blue></b> in front of the project name will <blue>remove</blue> ait to the selection.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print(`  -a, --all         - select all available projects`)
    help.Print(`  -d, --deselect    - deselect the currently active project`)
    help.Print(`  -h, --help        - print the help message`)
    help.Print(`  -l, --list        - list the active projects line by line`)
    help.Print(`  -s, --active      - show the current active project`)
    help.Print('')
    help.Print('ALIASED:')
    help.Print(`  <red>selected</red>   -> <red>select -s</red>`)
    help.Print(`  <red>active</red>     -> <red>select -s</red>`)
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
    help.Print(`  -h, --help        - print the help message`)
    help.Print('')
}