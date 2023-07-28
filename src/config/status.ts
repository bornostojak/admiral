import { exit } from 'process'
import { existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs'
import logging from '../logging'
import { ResolveUri } from '../helper/path'
import yaml from 'js-yaml'

let log = new logging("Config(Status)")


export interface IStatus {
    active: string[]
}

export class Status {

    public Active : string[] = [];
    public Confirmation : {
        Prompted: boolean,
        State: boolean
    } = {Prompted:false, State: false}

    
    /**
     * 
     * @returns return a JSON of the object
     */
    public toYAML() {
        let json = {
            active: this.Active,
            confirmation: {
                prompted: this.Confirmation?.Prompted,
                state: this.Confirmation?.State
            }
        }
        return yaml.dump(json, { indent: 2 })
    }
    
    /**
     * 
     * @returns return a JSON of the object
     */
    public toJSON() {
        let json = {
            Active: this.Active,
            Confirmation: {
                Prompted: this.Confirmation?.Prompted,
                State: this.Confirmation?.State
            }
        }
        return json
    }

    /**
     * 
     * @param yamlData the status information string in json format
     * @returns the Status object
     */
    public static fromYAML(yamlData: string): Status {
        let tmp = new Status()
        try {
            log.Debug("Converting Status from json string")
            let yamlParsed = yaml.load(yamlData) as { [key: string]: any }
            log.Trace(JSON.stringify(yamlParsed))
            tmp.Active = yamlParsed['active'] instanceof Array ? yamlParsed['active'] : []
            tmp.Confirmation = {
                Prompted: yamlParsed?.confirmation?.prompted ?? false,
                State: yamlParsed?.confirmation?.state ?? false
            }
            return tmp
        } catch(err) {
            log.Error('Failed to parse json data')
            log.Error("ERROR:")
            log.Error(err)
            log.Error("JSON:")
            log.Error({ yamlData })
            exit(1)
        }
    }

    /**
     * 
     * @param jsonData the status information string in json format
     * @returns the Status object
     */
    public static fromJSON(jsonData: string): Status {
        try {
            log.Debug("Converting Status from json string")
            let jsonParsed = JSON.parse(jsonData)
            log.Trace(JSON.stringify(jsonParsed))
            let tmp = new Status()
            tmp.Active = jsonParsed['Active'] instanceof Array ? jsonParsed['Active'] : []
            tmp.Confirmation = {
                Prompted: jsonParsed?.Confirmation?.Prompted ?? false,
                State: jsonParsed?.Confirmation?.State ?? false
            }
            return tmp
        } catch(err) {
            log.Error('Failed to parse json data')
            log.Error("ERROR:")
            log.Error(err)
            log.Error("JSON:")
            log.Error({jsonData})
            exit(1)
        }
    }

    /**
     * 
     * @param path the path of the JSON configuration file - default is LocalConfig.Path
     * @returns the local configuration in LocalConfig form, parsed
     */
    public static Load(path?: string) : Status {
        path = path ? path : this.Path()
        try {
            if (!path) {
                return Status.InitStatus()
            }
            return this.fromYAML(readFileSync(path).toString())
        } catch(err) {
            log.Error("Failed to load the Status file")
            log.Error({err})
            process.exit(1)
        }
    }

    /**
     * 
     * @param status the Status object to be serialized
     * @param path the path the file should be saved to - default is Status.Path()
     * @returns the same status object
     */
    public static Save(status: Status, path?: string) : Status {
        path = path ? path : this.Path()
        // convert to JSON string, ignore undefined values
        let statusJson = JSON.stringify(status, null, 4)
        // let statusJson = JSON.stringify(status, (key, val) => {
        //     if (val !== undefined) {
        //         return val
        //     }
        // }, 4)
        writeFileSync(path, status.toYAML())
        return status
    }

    /**
     * 
     * @returns the path of the status file
     */
    public static Path() : string {
        let directory = this.Directory()
        let path = `${directory}/status.yaml`
        if (!existsSync(path)) {
            // autoinitiating because a status file is always necessary
            Status.InitStatus()
        }
        return path
    }

    /**
     * 
     * @returns the directory of the status file
     */
    public static Directory(): string {
        // default directories, in order of priority
        let localDir = ResolveUri('~/.config/admiral')
        // if (!existsSync(localDir)) {
        //     mkdirSync(localDir, { recursive: true })
        // }
        return localDir
    }
    

    /**
     * 
     * Generates a default status file in the default ~/.config/admiral folder
     */
    public static InitStatus(status?: Status) : Status {
        let directory = ResolveUri("~/.config/admiral")
        if (!existsSync(directory)) {
            mkdirSync(directory, {recursive: true})
        }
        let statusPath = `${directory}/status.yaml`
        if (!existsSync(statusPath)) {
            return Status.Save(status ?? new Status(), ResolveUri(statusPath))
        }
        return Status.Load(statusPath)
    }
}
