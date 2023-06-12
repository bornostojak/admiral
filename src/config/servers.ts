import fs from 'fs'
import { GetLocalConfigLocation } from './manager'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'
import { Status } from './status'

const log = new logging('Servers')


export interface Server {
    username: String | undefined,
    password: String | undefined, 
    host: String | undefined,
    port: String | undefined,
    hostname: String | undefined,
    domain_names: Array<String> | undefined,
    manager: boolean | undefined,
    roles: Array<String> | undefined

}


export async function GrabServers(project: string) : Promise<Array<Server>> {
    let status = Status.Load()
    let serversFilePath =  path.join(GetLocalConfigLocation(), "projects", project, "servers.json")
    let serversFile = await fs.promises.readFile(serversFilePath)
    try {
        let servers = JSON.parse(serversFile.toString())
        //TODO: verify the server file
        return <Array<Server>>servers
    } catch (err) {
        log.Debug(`Servers file for <red>${project}</red> not found!`)
        log.Trace(err)
        return Array<Server>()
    }
}