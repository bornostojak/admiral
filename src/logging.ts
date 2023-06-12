import chalk, { ChalkInstance } from 'chalk'
import { listenerCount } from 'process'
import { stringify } from 'querystring'
import {inspect} from 'util'

export default class log{
    private static initial: log = new log()
    private _prefix: string = ""
    constructor(prefix?: string, chalk_method: ChalkInstance|null = chalk.bgCyan){
        if (!prefix) return
        this._prefix = prefix
        if (chalk_method)
            this._prefix = chalk_method(` ${this._prefix} `)


    }

    public prefix(prefix: string, chalk_method: ChalkInstance|null = chalk.bgCyan){
        return new log(prefix, chalk_method)
    }
    public log(message:any = "") {
        process.stdout.write(this.toString(message, this._prefix))
    }
    public debug(message:any = "") {
        let preString = this._prefix+chalk.bgBlack(chalk.white(" DEBUG "))
        process.stdout.write((this.toString(message, `${preString}`)))
    }

    private toString(obj: any, newLineStrat:string="") {
        let message:String;

        
        if (!(obj instanceof String || typeof obj == 'string')){
            message = inspect(obj).toString()
        }
        else {
            message = obj
        }
        let lines = message.split("\n")
        let result = ""
        for (let i = 0; i < lines.length; i++){
            result += `${newLineStrat}${lines[i]}\n`
        }
        return result
    }


    public static prefix(prefix: string, chalk_method: ChalkInstance|null = chalk.bgCyan){
        log.initial.prefix(prefix, chalk_method)
    }
    public static debug(message:string = "") {
        log.initial.log(message)
        //console.log(inspect(message))
    }
    public static log(message:string = "") {
        log.initial.debug(message)
    }

}