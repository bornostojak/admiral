import * as yaml from 'js-yaml'
import path, { parse } from 'path'
import fs from 'fs'
import { ResolveUri } from '../helper/path.js';
import { stderr, stdout } from 'process'
import chalk from 'chalk'
import { SSHCredentials } from './ssh.js';

export const ProjectName = 'Derrik'

interface ISSH {
    username: string|undefined,
    password: string|undefined,
    privateKey: string|undefined,
    publicKey: string|undefined,
}
interface ILogging {
    level: number,
    debug: number|string
}
export default class Config {
    constructor() {

    }
    public ssh : SSHCredentials|undefined;
    public logging : null | ILogging = {
        level: 1,
        debug: 0,
    }
    public get Path() {
        return GetLocalConfigLocation()
    }

    public static LoadFromStringSync(configString: string) {
        configString = configString.replace('"private_key"', '"privateKey"').replace('"public_key"', '"publicKey"')
        let parsed = yaml.load(configString) as any
        let tmp = new Config()
        
        if ("ssh" in parsed) {
            tmp.ssh = new SSHCredentials(parsed['ssh']) ?? undefined
        }
        if ('logging' in parsed)
            tmp.logging = {...tmp.logging, ...parsed['logging']}

        return tmp
    }
    public static LoadFromString(configString: string) {
        return new Promise<Config>((resolve, reject) => {
            try {
                resolve(Config.LoadFromStringSync(configString))
            }
            catch (err) {
                reject(err)
            }
        })
    }

    public static GetLocalConfigSync() {
        let configFile = Config.GetLocalConfigFilesSync(['config.json']).slice(0).join()
        if (configFile) {
            //log(`Loading from file: <blue>${configFile}</blue>`)
            let config = Config.LoadFromStringSync(fs.readFileSync(configFile).toString())
            return config
        }
    }
    public static GetLocalConfig() {
        return new Promise<Config>(async (res, rej) => {
            try {
                let configFile = (await Config.GetLocalConfigFiles(['config.json'])).slice(0).join()
                if (configFile) {
                    //log(`Loading from file: <blue>${configFile}</blue>`)
                    let config = Config.LoadFromString((await fs.promises.readFile(configFile)).toString())
                    res(config)
                }
            } catch (err) {
                rej(err)
            }
        })
    }


    public static GetLocalConfigFilesSync(filenames:string[]|null = null) {
            let dirs = ConfigLocations({exists: true})?.local
            let dir = dirs.reverse()[0]
            let dirEntries = fs.readdirSync(dir, {withFileTypes: true})
            let files = dirEntries?.filter(f => f.isFile() && (filenames === null ? true : filenames.includes(f.name) ))?.map(f => path.join(dir, f.name))
            return files
    }

    public static GetLocalConfigFiles(filenames:string[]|null = null) {
        return new Promise<string[]>(async (res, rej) => {
            try{
                let dirs = ConfigLocations({exists: true})?.local
                let dir = dirs.reverse()[0]
                let dirEntries = await fs.promises.readdir(dir, {withFileTypes: true})
                let files = dirEntries?.filter(f => f.isFile() && (filenames === null ? true : filenames.includes(f.name) ))?.map(f => path.join(dir, f.name))
                res(files)
            } catch(err) {
                rej(err)
            }

        })
    }
}



//TODO: support a location that can be defined using DERRIK_CONFIG env variable, useful for testing
export const Locations = {
        global: [
            '/etc/derrik'
            ].map(f => ResolveUri(f)),
        local:[
            ".derrik",
            "~/.derrik",
            "~/.config/derrik/"
        ].map(f => ResolveUri(f))
    }
export function GetLocalConfigLocation(options: any|undefined = undefined) {
    return ConfigLocations({exists:true})?.local[0]
}
export function ConfigLocations(options: any|undefined = undefined) {
    let dirs = Object.entries(Locations).map(([k, v]) => [k, v.filter(f => !options || (options['exists'] && fs.existsSync(f)))])
    return Object.fromEntries(dirs)
}

const commandSynonyms : Record<string, string> = {
    logging: "Logging",
    ssh: "SSH"
}
export function ProcessCommandSync(commands: string[]) {
    ProcessCommand(commands).then((res) => {
        return res
    })
}
export async function ProcessCommand(commands: string[]) {
    let config = await Config.GetLocalConfig()
    
    try {
        commands.forEach(command => 
        {
            let assign = command.split('=').slice(1).join('=')
            let location = command.split('=').slice(0,1).join().split('.')
            let root :any = config
            let broken = false;
            for (let i = 0; i < location.length; i++) {
                let loc = location[i]
                //if (Object.keys(commandSynonyms).includes(loc)) loc = commandSynonyms[command]
                if (!Object.keys(root).includes(loc)) {
                    broken = true
                    break
                }
                root = root[loc]
            }
            if (!assign) {
                //log({[location.join('.')]: root})//, "Process Command")
            }
            
        })
        
    } catch {

    }
}

//if (c.SSH?.privateKey)
    //console.log(fs.readFileSync(ResolveUri(c.SSH.privateKey)).toString())
//log.log(JSON.stringify(await GetLocalConfigFiles(['config.yaml'])))
//await fs.promises.readFile('')