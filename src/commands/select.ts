import fs, { stat } from 'fs'
import { GetStatusFileLocation, GetLocalConfigLocation, Locations } from '../config/manager'
import logging from '../logging'
import path from "path"
import { exit } from 'process'
import yargs, { boolean } from 'yargs'

let log = new logging("Select command")

export function ProcessCommandSync(args: string[]) {
    let parsedArgs = yargs.help(false).options({
        "show": {type: 'boolean', alias: 's'},
        "help": {type: 'boolean', alias: 'h'},
        "deselect": {type: 'boolean', alias: 'd'},
    }).parse(args)
    let project = parsedArgs.deselect ? null : parsedArgs?._[0]

    let status = readStatusFromFileSync()
    if (parsedArgs.help) {
        log.Log('mob <red>select</red> <PROJECT> [OPTIONS]\n\nOPTIONS:')
        log.Log('mob <red>select</red> <PROJECT> [OPTIONS]\n\nOPTIONS:')
        log.Log(`  -s,--show      - show the current active project`)
        log.Log(`  -d,--deselect  - deselect the currently active project`)
        exit(0)
    }
    if (parsedArgs.deselect){
        DeselectSync(status)
        exit(0)
    }
    if (parsedArgs.show){
        log.Log(status?.active ?? "<red>There are currently no active projects</red>" )
        exit(status.active === null ? 1 : 0)
    }
    
    if (project === undefined) {
        promptForProjects()
        exit(0)
    }

    validateSelection(project)
    status['active'] = project
    updateStatusFileSync(status)
    log.Log(parsedArgs.deselect ?  "Project has been deselected" : `Project set to <blue>${project}</blue>`)
}


/**
 * Prompt the user to select a project from all existing projects
 */
function promptForProjects(){
    //TODO: prompt for existing projects
}


function validateSelection(project:string|number|null|undefined) {
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
        let projects = JSON.parse(projectsFileContent)
        if (!(projects instanceof Array)) {
            log.Error("Wrong syntax in <red>projects.json</red>!")
            log.Trace({projectsFileContent})
            exit(1)
        }
        if (!projects.map(s => s['name']).includes(project)) {
            log.Log(`The project <b><red>${project}</red></b> does not exist!`)
            exit(1)
        }
    } catch (err) {
        log.Error(`An error occurred whilst parsing <b><red>${projectsFilePath}</red></b>`)
        exit(1)
    }
}

export async function ProcessCommand(args: string[]) {
    console.log(JSON.stringify(await readStatusFromFile()))
}


export async function updateStatusFile(status:any) {
    await fs.promises.writeFile(getStatusFile() ,JSON.stringify(status, null, 4))
}
export function updateStatusFileSync(status:any) {
    fs.writeFileSync(getStatusFile() ,JSON.stringify(status, null, 4))
}


export async function Deselect(status?:any){
    if (!status){
        status = await readStatusFromFile()
    }
    status['active'] = null
    await updateStatusFile(status)
    log.Log('Project has been deselected')
}
export function DeselectSync(status?:any){
    if (!status){
        status = readStatusFromFileSync()
    }
    status['active'] = null
    updateStatusFileSync(status)
    log.Log('Project has been deselected')
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


