import { GetLocalConfigLocation, Locations } from './manager'
import { exit } from 'process'
import fs from 'fs'
import path from 'path'
import logging from '../logging'

let log = new logging("Command Helpers")


interface Status {
    active: string[]
}

export function ReadStatusFromFileSync() : Status {
    let statusFile = GetStatusFile()
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

export async function ReadStatusFromFile() {
    let statusFile = GetStatusFile()
    let fileContent = await fs.promises.readFile(statusFile)
    try {
        return JSON.parse(fileContent.toString())
    } catch(err) {
        log.Error(`The file <red>${statusFile}</red> could not be properly parsed`)
        exit(1)
    }

}
//TODO: move to config/status
export function GetStatusFile() {
    let statusFile = GetStatusFileLocation()
    if (statusFile === null) {
        log.Error("The status file could not be located.\nSelect one of the following locations and there configure a <red>status.json</red> file:\n\n")
        log.Error(Locations?.local)
        exit(1)
    }
    return statusFile
}

export async function UpdateStatusFile(status:any) {
    await fs.promises.writeFile(GetStatusFile() ,JSON.stringify(status, null, 4))
}
export function UpdateStatusFileSync(status:any) {
    fs.writeFileSync(GetStatusFile() ,JSON.stringify(status, null, 4))
}

export function GetStatusFileLocation() {
    let localConfig = GetLocalConfigLocation()
    if (!localConfig){
        return null
    }
    let statusFile = path.join(localConfig, 'status.json')
    return statusFile
}
