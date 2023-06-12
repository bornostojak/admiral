import fs, { existsSync, readFileSync, readdirSync } from 'fs'
import { GetLocalConfigLocation } from './manager'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'
import { Status } from './status'
import { type } from 'os'
import { array } from 'yargs'
import { LocalConfig } from '.'
import ProjectConfig from './project'
import { ResolveUri } from '../helper/path'
import { LocalProjectDirectory } from '../commands/project/list'

const log = new logging('Servers')


export enum DockerRoleEnum {
    manager = 1,
    worker = 2
}


export interface IServerOld {
    username: String | undefined,
    password: String | undefined, 
    host: String | undefined,
    port: String | undefined,
    hostname: String | undefined,
    domain_names: Array<String> | undefined,
    manager: boolean | undefined,
    roles: Array<String> | undefined

}

export interface IServer {
    Hostname: string,
    IPv4: string,
    IPv6: string,
    SSHPort: number,
    Tags: string[],
    DNS: {
        FQDN: string[],
        Nameservers: string[]
    },
    Docker: {
        Role: DockerRoleEnum
        Labels: { [key: string]: string },
        Cgroup: string,
        DaemonConfig: { [key: string]: any }
    }

}

export default class Server implements IServer {
    public Hostname: string = ""
    public IPv4: string = ""
    public IPv6: string = ""
    public SSHPort: number = 22
    public Tags: string[] = []
    public DNS: { FQDN: string[], Nameservers: string[] } = {
        FQDN: [],
        Nameservers: []
    }
    public Docker: { Role: DockerRoleEnum; Labels: { [key: string]: string }; Cgroup: string; DaemonConfig: { [key: string]: any } } = {
        Role: DockerRoleEnum.worker,
        Labels: {},
        Cgroup: "2",
        DaemonConfig: {}
    }

    public toJSON() {
        return Object.fromEntries(Object.entries({
            Hostname: this.Hostname,
            IPv4: this.IPv4,
            IPv6: this.IPv6,
            SSHPort: this.SSHPort,
            Tags: this.Tags.map(t => String(t)),
            DNS: this.DNS,
            Docker: this.Docker
        }).filter(([k, v]) => typeof v === "boolean" ? true : v ))
    }
    public static fromJSON(jsonData: { [key: string]: any }): Server;
    public static fromJSON(jsonData: string): Server;
    public static fromJSON(arg: unknown): Server {
        log.Trace({ "Parsing SERVER, JSON data": arg })
        let server: Server = new Server()
        try {
            let parsedJson: { [key: string]: any }
            if (typeof arg === "string") {
                parsedJson = JSON.parse(arg as string) as IServer
            }
            else {
                parsedJson = arg as IServer
            }
            server.Hostname = parsedJson.Hostname as string
            server.IPv4 = parsedJson.IPv4 as string
            server.IPv6 = parsedJson.IPv6 as string
            server.DNS = parsedJson.DNS
            server.SSHPort = parsedJson.SSHPort as number
            server.Docker = parsedJson.Docker
            server.Tags = (parsedJson.Tags as any[]).map(t => t as string)
        } catch(err) {
            log.Error("Encountered error while parsing server json string")
            log.Error({ type: typeof arg, jsonData: arg })
            log.Error("Error:")
            log.Error(err)
            exit(1)
        }
        return server
    }
    public static LoadServersForProject(project: string): Server[] {
        log.Debug(`Getting servers for project: ${project}`)
        // let projectDir = path.join(LocalConfig.Directory(), "projects")
        // let projectDir = LocalProjectDirectory
        let projectDir = ProjectConfig.Directory()
        let projectServerDirPath = path.join(projectDir, project, "servers")
        if (!existsSync(projectServerDirPath)) {
            log.Debug(`No <red>servers</red> folder was defined for project ${project}`)
            return []
        }
        let projectDirInfo = readdirSync(projectServerDirPath, { withFileTypes: true })
        let serverDirArray = projectDirInfo.filter((pd) => pd.isDirectory() && !pd.name.startsWith('.')).map((pd) => path.join(projectServerDirPath,pd.name))
        let serverConfigFilePathArray = serverDirArray.map(pd => path.join(pd, "server.json"))
        let missingServerConfigFiles = serverConfigFilePathArray.filter(scf => !existsSync(scf))
        if (missingServerConfigFiles.length > 0) {
            log.Debug("Missing server config file in following server configurations:")
            log.Debug("  " + missingServerConfigFiles.map(scf => `<red><b>${scf}</b></red>`).join('\n  '))
        }
        let servers = serverConfigFilePathArray.filter(s => !missingServerConfigFiles.includes(s)).map(s => Server.LoadFromFile(s))
        return servers
    }
    public static LoadFromFile(path: string): Server {
        log.Debug(`Parsing Server file: ${path}`)
        if (!existsSync(path)) {
            log.Error(`Error parsing <red>${path}</red> as server: missing file`)
            exit(1)
        }
        let serverFileContent = readFileSync(path).toString()
        log.Trace({ objective: "Parsing server file to server", path, serverFileContent })
        return Server.fromJSON(serverFileContent)
    }
}



export async function GrabServers(project: string) : Promise<Array<IServerOld>> {
    let status = Status.Load()
    let serversFilePath =  path.join(GetLocalConfigLocation(), "projects", project, "servers.json")
    let serversFile = await fs.promises.readFile(serversFilePath)
    try {
        let servers = JSON.parse(serversFile.toString())
        //TODO: verify the server file
        return <Array<IServerOld>>servers
    } catch (err) {
        log.Debug(`Servers file for <red>${project}</red> not found!`)
        log.Trace(err)
        return Array<IServerOld>()
    }
}



class IPv4 {
    _address: string = '0.0.0.0'
    _value: number = 0
    
    public get Value() {
        return this._value
    }

    // constructor(ipInt: number);
    constructor();
    constructor(ip: string);
    constructor(arg?: unknown) {
        let parsedValue = IPv4.ConvertIPToValue(arg as string)
        if (isNaN(parsedValue)) return
        this._value = parsedValue
    }
    
    public MaskedBy(mask: string | IPv4): string {
        if (typeof mask === "string") {
            mask = new IPv4(mask)
        }
        return IPv4.ConvertValueToIP((this._value & mask.Value) >>> 0)
    }

    public get Address() {
        return IPv4.ConvertValueToIP(this._value)
    }
    public set Address(ip: string) {
        if (!IPv4.Validate(ip)) {
            log.Error(`<red><b>Invalid IP address assignment:</b></red> ${ip as string}`)
        }
        this._value = IPv4.ConvertIPToValue(ip)
    }
    

    
    public static Validate(ip: string) {
        if (ip.length > 15 || ip.length < 7) {
            return false
        }
        let octets = ip.split('.')
        if (octets.length != 4) {
            return false
        }
        let ipValidator = octets
            .map(x => parseInt(x))
            .filter(x => !isNaN(x) && x >= 0 && x < 256)
        return 
    }
    public static ConvertValueToIP(value: number): string {
        log.Debug(`Converting Value to IP: ${value}`)
        if (value > 4294967295 || value < 0) {
            return "0.0.0.0"
        }
        let valueArray = [value >> 24  , value >> 16, value >> 8, value].map(v => v & 255)
        log.Debug(`Values: ${valueArray}`)
        return valueArray.join('.')
        
    }
    public static ConvertIPToValue(ip: string): number {
        if (!IPv4.Validate(ip)) {
            return NaN
        }
        log.Debug(`Converting IP to Value: ${ip}`)
        let octets = ip.split('.').map(o => parseInt(o))
        log.Debug(`Octets: ${octets}`)
        let octetBits = [(octets[0] << 24) >>> 0, (octets[1] << 16) >>> 0 , (octets[2] << 8) >>> 0, octets[3]]
        log.Debug(`Bits: ${octetBits}`)
        let result = octetBits.reduce((agr, val) => agr + val)
        log.Debug(`IP as value: ${result}`)
        return result
    }
    
    public static Mask(ip: IPv4|string, mask: IPv4|string) : IPv4 {
        if (typeof ip === "string") {
            ip = new IPv4(ip)
        }
        if (typeof mask === "string") {
            mask = new IPv4(mask)
        }
        return new IPv4(ip.MaskedBy(mask))
    }

}