import fs from 'fs'
import { GetLocalConfigLocation } from './manager'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'

const log = new logging('Project configuration')

export function GetProjectsFileLocation(ignoreMissing:boolean = true) :string|null {
    let configsPath = GetLocalConfigLocation()
    let dirs = fs.readdirSync(configsPath)
    if (!dirs.includes('projects.json')){
        log.Error("The local config folder doesn't include a <red>projects.json</red> file!")
        //TODO: explain how to get a projects.json file
        if (ignoreMissing)
            return null
        exit(1)
    }
    let projectsFilePath = path.join(configsPath, "projects.json")
    return projectsFilePath
}


function validateProjectFile(projects:any) {
    log.Trace({projects})
    //TODO: validate that the project file is valid
    return projects
}

export async function GetExistingProjects() : Promise<fs.Dirent[]> {
    let dir = (await fs.promises.readdir(path.join(GetLocalConfigLocation(), "projects"), {withFileTypes: true}))
                .filter(dirent => dirent.isDirectory())
    return dir
}

export function GetExistingProjectsSync() : fs.Dirent[] {
    let dir = fs.readdirSync(path.join(GetLocalConfigLocation(), "projects"), {withFileTypes: true})
                .filter(dirent => dirent.isDirectory())
    return dir
}

export function GetProjectsFileSync() {
    let projectsFilePath = GetProjectsFileLocation()
    if (projectsFilePath === null) exit(1)
    try {
        let projectsFileContent = fs.readFileSync(projectsFilePath).toString()
        let definedProjects : Array<Record<string, any>> = JSON.parse(projectsFileContent)
        validateProjectFile(definedProjects)
        return definedProjects
    } catch (err) {
        log.Error(`An error occurred whilst parsing <b><red>${projectsFilePath}</red></b>`)
        log.Trace({err})
        exit(1)
    }
}
export function SetProjectsFileSync(projects:any) : void {
    let projectsFilePath = GetProjectsFileLocation()
    if (projectsFilePath === null) {
        log.Error("Failed updating <red>projects.json</red>")
        exit(1)
    }
    try {
        validateProjectFile(projects)
        fs.writeFileSync(projectsFilePath, JSON.stringify(projects))
    } catch (err) {
        log.Error(`An error occurred whilst updating <b><red>${projectsFilePath}</red></b>`)
        log.Trace({err})
        exit(1)
    }
}