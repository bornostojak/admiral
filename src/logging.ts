import chalk, { ChalkInstance } from 'chalk'
import { info } from 'console'
import { listenerCount, stderr } from 'process'
import { stringify } from 'querystring'
import {inspect} from 'util'

export default class log{

    private static colors(method:string) {
        let options: Record<string, ChalkInstance> = {
            "red" : chalk.red,
            "green" : chalk.green,
            "blue" : chalk.blue,
            "yellow" : chalk.yellow,
            "magenta" : chalk.magenta,
            "coutyan" : chalk.cyan,
            "white" : chalk.white,
            "black" : chalk.black,
            "b" : chalk.bold,
            "i": chalk.italic,
            "u": chalk.underline,
        }
        if (!(method in options)) return (m:string) => m
        return (m:string) => (<ChalkInstance>options[method])(m)
    } 
    private static initial: log = new log()
    private _prefix: string = ""
    constructor(prefix?: string, chalk_method: ChalkInstance|null = chalk.bgMagenta){
        if (!prefix) return
        this._prefix = prefix
        if (chalk_method)
            this._prefix = chalk_method(`[ ${this._prefix} ]`)


    }

    public prefix(prefix: string, chalk_method: ChalkInstance|null = chalk.bgMagenta){
        return new log(prefix, chalk_method)
    }
    public log(message:any = "") {
        let text = (this.toString(message, this._prefix))
        log.print(text, process.stdout)
    }
    public error(message:any = "") {
        let preString = chalk.bgRed("[ ERROR ]")+this._prefix
        let text = (this.toString(message, `${preString}`))
        log.print(text, process.stderr)
    }
    public debug(message:any = "") {
        let pico = process.env["DEBUG"] == null
        if (process.env["DEBUG"] == null) return
        let preString = chalk.bgBlack(chalk.white("[ DEBUG ]"))+this._prefix
        let text = (this.toString(message, `${preString}`))
        log.print(text, process.stdout)
    }

    private static print(message:string, method:NodeJS.WriteStream) {
        method.write(message)
        let logString = message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
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
        if (newLineStrat) newLineStrat += " "
        for (let i = 0; i < lines.length; i++){
            result += `${newLineStrat}${log.formatting(lines[i])}\n`
        }
        return result
    }

    private static formatting(message:string): string {
        let match = /<[a-zA-Z]*>/g
        let infoStart = match.exec(message)
        if (infoStart === null) return message
        let endmatch = new RegExp(infoStart[0].replace(/^</, '</'), 'g')
        let infoEnd = endmatch.exec(message.slice(infoStart.index + infoStart[0].length))
        if (infoEnd === null) return message.slice(0,infoStart.index+infoStart[0].length)+(this.formatting(message.slice(infoStart.index+infoStart[0].length)))
        infoEnd.index += infoStart[0].length+infoStart.index
        let method = infoStart[0].replace(/^</, '').replace(/>$/, '')
        let replacement = message.slice(infoStart.index+infoStart[0].length, infoEnd.index)
        replacement = this.formatting(replacement)
        replacement = log.colors(method)(replacement)
        return log.formatting(message.slice(0, infoStart.index)+replacement+message.slice(infoEnd.index+infoEnd[0].length))
    }


    public static prefix(prefix: string, chalk_method: ChalkInstance|null = chalk.bgMagenta){
        return log.initial.prefix(prefix, chalk_method)
    }
    public static error(message:any = "") {
        log.initial.error(message)
    }
    public static debug(message:any = "") {
        log.initial.debug(message)
        //console.log(inspect(message))
    }
    public static log(message:any = "") {
        log.initial.log(message)
    }

}



//log.prefix("initial testing").log("<u>formatt <b>me bold</b><u>")
//log.prefix("initial testing").error("<u>formatt <b>me bold</b></u>")
//log.prefix("initial testing").debug("formatt <blue><b><i>me italic</i></b></blue>")