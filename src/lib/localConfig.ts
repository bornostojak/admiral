import fs, { existsSync, lstat, mkdir, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { ResolveUri } from './helpers/path.js';
import { SSHCredentials } from './ssh.js';
import logging from '../logging.js'
import LoggingConfig from './logging.js'
import { exit } from 'process';
import yaml from 'js-yaml'

export const ProjectName = 'Admiral'

let Log = new logging("Config(Local)")

enum ConfirmationEnum {
    always = 4,
    critical = 2,
    once = 1,
    never = 0
}

export default class LocalConfig {
    
    public Confirmation : ConfirmationEnum = ConfirmationEnum.always
    public SSH : SSHCredentials = new SSHCredentials();
    public Logging : LoggingConfig = LoggingConfig.Load()
    public Visual : string|undefined;
    public Editor : string|undefined;

    /**
     * 
     * @param indent the indentation of the a JSON object
     * @returns the JSON string
     */
    public toYAML(): string {
        let {Username, Password, PrivateKey, PublicKey, ..._} = this.SSH
        let {Visual, Editor, ...__} = this
        let json = {} as { [key: string]: any }
        if (Visual)
            json["visual"] = Visual
        if (Editor)
            json["editor"] = Editor
        if (this.Confirmation)
            json["confirmation"] = ConfirmationEnum[this.Confirmation]
        if (this.Logging)
            json["logging"] = this.Logging.toObject()
        if (this.Logging)
            json["ssh"] = Object.fromEntries(Object.entries({username: Username, password: Password, privatekey: PrivateKey, publickey: PublicKey}).filter(([x,y]) => y))
        
        return yaml.dump(json, { indent: 2 })
    }


    /**
     * 
     * @param indent the indentation of the a JSON object
     * @returns the JSON string
     */
    public toJSON() {
        let {Username, Password, PrivateKey, PublicKey, ..._} = this.SSH
        let {Visual, Editor, ...__} = this
        let json = {
            Visual,
            Editor,
            Confirmation: ConfirmationEnum[this.Confirmation],
            Logging: this.Logging.toObject(),
            SSH: {Username, Password, PrivateKey, PublicKey},
        }
        return json
    }

    /**
     * 
     * @param jsonData the local configuration data string in JSON format
     * @returns the LocalConfig object
     */
    public static fromJSON(jsonData: string) {
        try {
            let jsonParsed = JSON.parse(jsonData)
            Log.Log(JSON.stringify(jsonParsed, null, 0))
            let tmp = new LocalConfig()
            tmp.Confirmation = Object(ConfirmationEnum)[jsonParsed['Confirmation'] ?? 'always']
            tmp.SSH = new SSHCredentials(jsonParsed['SSH'] as {[key:string]: string})
            tmp.Logging = new LoggingConfig(jsonParsed['Logging'] as {[key:string]: string})
            tmp.Visual = jsonParsed['Visual']
            tmp.Editor = jsonParsed['Editor']
            return tmp
        } catch (err) {
            Log.Error("An error occurred while parsing the local configuration")
            Log.Error(err)
            exit(1)
        }
    }
    

    /**
     * 
     * @param yamlData the local configuration data string in YAML format
     * @returns the LocalConfig object
     */
    public static fromYAML(yamlData: string) {
        try {
            let yamlParsed = yaml.load(yamlData) as { [key: string]: any }
            Log.Log(JSON.stringify(yamlParsed, null, 0))
            let tmp = new LocalConfig()
            tmp.Confirmation = Object(ConfirmationEnum)[yamlParsed['confirmation'] ?? 'always']
            let ssh = yamlParsed['ssh'] as {[key:string]: string}
            tmp.SSH = new SSHCredentials({
                Username: ssh.username,
                Password: ssh.password,
                PrivateKey: ssh.privatekey,
                PublicKey: ssh.publickey
            })
            tmp.Logging = new LoggingConfig(yamlParsed['logging'] as {[key:string]: string})
            tmp.Visual = yamlParsed['visual']
            tmp.Editor = yamlParsed['editor']
            return tmp
        } catch (err) {
            Log.Error("An error occurred while parsing the local configuration")
            Log.Error(err)
            exit(1)
        }
    }
    

    /**
     * 
     * @param path the path of the JSON configuration file - default is LocalConfig.Path
     * @returns the local configuration in LocalConfig form, parsed
     */
    public static Load(path?: string) : LocalConfig {
        path = path ? path : this.Path()
        try {
            let localConfig = new LocalConfig()
            let localConfigJson = readFileSync(path).toString()
            Log.Trace(localConfigJson)
            return LocalConfig.fromYAML(localConfigJson)
        } catch (err) {
            if (path)
                Log.Error(`<red><b>The configuration from '${path}' could not be loaded!</b></red>`)
            else
                Log.Error(`<red><b>A local configuration hasn't been defined yet!</b></red>`)
            Log.Error()
            Log.Error(`run <cyan><b>admiral config init</b></cyan>`)
            process.exit(1)
        }
    }

    /**
     * 
     * @param config the LocalConfig object to be serialized
     * @param path the path the file should be saved to - default is LocalConfig.Path()
     * @returns the same config object
     */
    public static SaveJSON(config: LocalConfig, path?: string) : LocalConfig {
        path = path ? path : this.Path()
        if(!path) {
            LocalConfig.InitLocalConfig(config)
            return config
        }
        writeFileSync(path, JSON.stringify(config, (key, val) => {
            if (val !== undefined) {
                return val
            }
        }, 4))
        return config
    }

    /**
     * 
     * @param config the LocalConfig object to be serialized
     * @param path the path the file should be saved to - default is LocalConfig.Path()
     * @returns the same config object
     */
    public static Save(config: LocalConfig, path?: string) : LocalConfig {
        path = path ? path : this.Path()
        if(!path) {
            LocalConfig.InitLocalConfig(config)
            return config
        }
        writeFileSync(path, config.toYAML())
        return config
    }

    

    /**
     * 
     * @returns the path of the local configuration file
     */
    public static Path() : string {
        let directory = this.Directory()
        let path = `${directory}/config.yaml`
        if (!existsSync(path)) {
            return ""
            // this.InitLocalConfig()
        }
        return path
    }

    /**
     * 
     * The directory of the local configuration file
     */
    public static Directory(initIfMissing?: boolean): string {
        // default directories, in order of priority
        let directories = [".admiral", "~/.admiral", "~/.config/admiral"].map(d => ResolveUri(d))
        let location: string = ''
        for (location of directories) {
            // skip if not missing
            if (!existsSync(location)) continue;
            // return the first existing path
            return location
        }
        // finally, if nothing exists, create the last folder: ~/.config/admiral
        if (initIfMissing) {
            this.InitLocalConfig()
        }
        return location
    }
    
    /**
     * 
     * Generates a default local config in the default ~/.config/admiral folder
     */
    public static InitLocalConfig(config?: LocalConfig) {
        let directory = ResolveUri("~/.config/admiral")
        if (!existsSync(directory)) {
            mkdirSync(directory, {recursive: true})
        }
        let configPath = `${directory}/config.yaml`
        if (!existsSync(configPath)) {
            return LocalConfig.Save(config ?? new LocalConfig(), ResolveUri(configPath))
        }
        return LocalConfig.Load()
    }
}
