import { existsSync, readFileSync } from "fs"
import { isNullOrUndefined } from "util"
import { number, string } from "yargs"
import * as Json from "../helper/json"
import { ResolveUri } from "../helper/path"
import LocalConfig from "./localConfig"



export enum LoggingDepthEnum {
    full = 2,
    inner = 1, 
    off = 0
}
// enum LoggingLevelEnum {
    // trace                   = 31,  // 00011111
    // info                    = 15,  // 00001111
    // warning                 = 7,   // 00000111
    // debug                   = 3,   // 00000011
    // log                     = 1,   // 00000001
    // error                   = 0,   // 00000000
    // off                     = -1   // 11111111
// }
export enum LoggingLevelEnum {
    trace                   = 4,  // 00011111
    info                    = 3,  // 00001111
    warning                 = 3,   // 00000111
    debug                   = 1,   // 00000011
    error                   = 0,   // 00000000
}



interface ILogging {
    Level: LoggingLevelEnum
    Color: boolean
}


export default class LoggingConfig implements ILogging {
    public Level: LoggingLevelEnum = LoggingLevelEnum.error
    public Depth: LoggingDepthEnum = LoggingDepthEnum.off
    public Color: boolean = true 

    constructor(loggingData: LoggingConfig);
    constructor({ ...loggingData }: { [key: string]: string });
    constructor();
    constructor(args1?: any) {
        if (!args1) return this
        this.Level = Object.entries(LoggingLevelEnum).filter(([key, val]) => val === args1.Level ?? 'error').map(([k,v]) => v as LoggingLevelEnum)[0] ?? LoggingLevelEnum.error
        this.Depth = Object.entries(LoggingDepthEnum).filter(([key, val]) => val === args1.Depth ?? 'off').map(([k,v]) => v as LoggingDepthEnum)[0] ?? LoggingDepthEnum.off
        this.Color = !!args1.Color
        return this
    }

    public toObject() : {Level: string, Depth: string, Color: boolean} {
        return {
            Level: Object.entries(LoggingLevelEnum).filter(([k,v]) => v === this.Level)[0][0] ?? 'error',
            Depth: Object.entries(LoggingDepthEnum).filter(([k,v]) => v === this.Depth)[0][0] ?? 'off',
            Color: this.Color
            
        }
    }

    public toJSON(indent?: number) : string {
        try {
            return indent ? JSON.stringify(this.toObject(), null, indent) : JSON.stringify(this.toObject()) 
        } catch {
            let obj = {Level: 'error', Depth: 'off', Color: true}
            return indent ? JSON.stringify(obj, null, indent) : JSON.stringify(obj) 
        }
    }

    public static fromJSON(jsonData: string) : LoggingConfig {
        try {
            let localConfigObj = JSON.parse(jsonData)
            let tmp = new LoggingConfig()
            // tmp.Level = Object.entries(LoggingLevelEnum).filter(([k,v]) => (k === (localConfigObj['Level'].toString() as string).toLowerCase())).map(([k,v]) => v as LoggingLevelEnum)[0] ?? LoggingLevelEnum.error
            // tmp.Depth = Object.entries(LoggingDepthEnum).filter(([k,v]) => (k === (localConfigObj['Depth'].toString() as string).toLowerCase())).map(([k,v]) => v as LoggingDepthEnum)[0] ?? LoggingDepthEnum.off
            tmp.Color = "Color" in localConfigObj?.Logging ? !!localConfigObj?.Logging?.Color : true
            switch(localConfigObj?.Logging?.Level ?? 'error') {
                case "1":
                case "error":
                    tmp.Level = LoggingLevelEnum.error
                    break
                case "2":
                case "debug":
                    tmp.Level = LoggingLevelEnum.debug
                    break
                case "3":
                case "warning":
                    tmp.Level = LoggingLevelEnum.warning
                    break
                case "4":
                case "info":
                    tmp.Level = LoggingLevelEnum.info
                    break
                case "5":
                case "trace":
                    tmp.Level = LoggingLevelEnum.trace
                    break
                default:
                    tmp.Level = LoggingLevelEnum.error
            }
            switch(localConfigObj?.Logging?.Depth ?? 'off') {
                case "0":
                case "off":
                    tmp.Depth = LoggingDepthEnum.off
                    break
                case "1":
                case "inner":
                    tmp.Depth = LoggingDepthEnum.inner
                    break
                case "2":
                case "full":
                    tmp.Depth = LoggingDepthEnum.full
                    break
                default:
                    tmp.Depth = LoggingDepthEnum.off
                    break
            }
            
            return tmp
        } catch {
            return new LoggingConfig()
        }
    }
    public static Load() : LoggingConfig {
        let path = [ ".admiral", "~/.admiral", "~/.config/admiral/" ]
            .map(f => ResolveUri(f))
            .filter(x => existsSync(x))[0]

        if (!existsSync(path) || !existsSync(`${path}/config.json`)) {
            return new LoggingConfig() 
                
        }

        try {
            let localConfig = this.fromJSON(readFileSync(`${path}/config.json`).toString())
            return localConfig
            //return Object.assign(new LoggingConfig(), {...localConfig['Logging']})
        } catch {
            return Object.assign(new LoggingConfig(), {Level: 1, Depth: 0})
        }
    }
}