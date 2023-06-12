//import { Chalk } from 'chalk'
import { env, stderr, stdout } from 'process'
import chalk, { Chalk } from 'chalk'
import { inspect } from 'util'
import Config from './config/manager.js'

let config = Config.GetLocalConfigSync();

export default class log{

    private static op = Boolean(stdout.isTTY) ? ' ' : ''
    private static ed = Boolean(stdout.isTTY) ? ' ' : ''
    private static _joint = Boolean(stdout.isTTY) ? '' : ' > '

    private static _logLevel = parseInt(env["LOGLEVEL"] ?? (config?.logging?.level.toString() ?? '1'))
    private static _debug = 0 + (env["DEBUG"] !== undefined && !isNaN(parseInt(env["DEBUG"])) ? parseInt(env["DEBUG"]) : parseInt(config?.logging?.debug?.toString() ?? "0"))



    private static rotBgColor(messages: string[], joiner:string = '') {
        let parsed = []
        messages = this._logLevel > 1 ? messages : messages.slice(0,1)
        const colorWheel = [
            (m:string) => chalk.black(chalk.bgRgb(167, 123, 76)(m)),
            (m:string) => chalk.black(chalk.bgRgb(111, 211, 108)(m)),
            (m:string) => chalk.white(chalk.bgRgb(56, 77, 145)(m)),
            (m:string) => chalk.black(chalk.bgRgb(133, 145, 98)(m)),
            (m:string) => chalk.white(chalk.bgRgb(79, 31, 222)(m)),
            (m:string) => chalk.black(chalk.bgRgb(200, 99, 56)(m)),
            (m:string) => chalk.black(chalk.bgRgb(214, 107, 189)(m)),
            (m:string) => chalk.black(chalk.bgRgb(156, 195, 15)(m))
        ]
        for (let i = 0; i < messages.length; i++) {
            parsed.push(colorWheel[i%colorWheel.length](log.op+messages[i]+log.ed+joiner))
        }
        return this._logLevel > 0 ? parsed.join(log._joint)+log._joint : ''
    }

    public static Colors(method:string) {
        let options: Record<string, Chalk> = {
            "red" : chalk.red,
            "green" : chalk.green,
            "blue" : chalk.blue,
            "yellow" : chalk.yellow,
            "magenta" : chalk.magenta,
            "cyan" : chalk.cyan,
            "white" : chalk.white,
            "black" : chalk.black,
            "b" : chalk.bold,
            "i": chalk.italic,
            "u": chalk.underline,
        }
        if (!(method in options)) return (m:string) => m
        return (m:string) => (<Chalk>options[method])(m)
    } 
    private static initial: log = new log()
    private _prefixes: string[] = []
    constructor(prefix?: string){
        if (!prefix) return
        this._prefixes.push(prefix)
    }

    public Prefix(prefix: string, chalk_method: Chalk|null = chalk.bgMagenta){
        let tmp = new log()
        tmp._prefixes = [...this._prefixes.map(s => s)]
        if (prefix)
            tmp._prefixes.push(prefix)
        return tmp
    }

    public Print(message:any = "", logMessage:boolean=false) {
        let text = (ConvertToString(message, log.rotBgColor(this._prefixes) + (log._debug == 0 ? '' : chalk.bgBlack(chalk.white(log.op+"PRINT"+log.ed+log._joint)))))
        log.write(text, stdout)
        if (logMessage)
            this.logToFile(message, '')
        return message
    }

    public Log(message:any = "") {
        let text = (ConvertToString(message, log.rotBgColor(this._prefixes) + (log._debug == 0 ? '' : chalk.bgBlack(chalk.white(log.op+"LOG"+log.ed+log._joint)))))
        this.logToFile(message, '')
        if (log._debug < 1) return
        log.write(text, stdout)
    }

    public Error(message:any = "") {
        let preString = chalk.bold(chalk.bgRed(log.op+"ERROR"+log.ed))+log.rotBgColor(this._prefixes)
        let text = (ConvertToString(message, `${preString}`))
        log.write(text, stderr)
        this.logToFile(message, '')
    }

    public Info(message:any = "") {
        let preString = log.rotBgColor(this._prefixes) + (log._debug == 0 ? '' : chalk.bgBlack(chalk.white(log.op+"INFO"+log.ed+log._joint)))
        let text = (ConvertToString(message, `${preString}`))
        this.logToFile(message, "")
        if (log._debug < 1) return
        log.write(text, stdout)
    }

    public Trace(message:any = "") {
        let preString = log.rotBgColor(this._prefixes) + chalk.bgBlack(chalk.white(log.op+"TRACE"+log.ed+log._joint))
        let text = (ConvertToString(message, `${preString}`))
        this.logToFile(message, "")
        if (log._debug < 2) return
        log.write(text, stdout)
    }

    public Debug(message:any = "") {
        let preString = log.rotBgColor(this._prefixes) + chalk.bgBlack(chalk.white(log.op+"DEBUG"+log.ed+log._joint))
        let text = (ConvertToString(message, `${preString}`))
        this.logToFile(message, "")
        if (log._debug < 1) return
        log.write(text, stdout)
    }

    private static write(message:string, method:NodeJS.WriteStream) {
        method.write(message)
    }

    private logToFile(message:string, filePath: string) {
        message = ConvertToString(message)
        let logString = message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
        //TODO: wirte logging to file
    }


    /**
     * Puts a colored prefix before every line in the log
     * 
     * This allow the log to be more easily readable and related to a given line of execution
     * @param prefix 
     * @param chalk_method 
     */
    public static Prefix(prefix: string, chalk_method: Chalk|null = chalk.bgMagenta){
        return log.initial.Prefix(prefix, chalk_method)
    }
    public static Error(message:any = "") {
        log.initial.Error(message)
    }
    public static Trace(message:any = "") {
        log.initial.Trace(message)
    }
    public static Debug(message:any = "") {
        log.initial.Debug(message)
    }
    public static Log(message:any = "") {
        log.initial.Log(message)
    }
    public static Print(message:any = "") {
        log.initial.Print(message)
    }

    public static SetLogLevel(level :number) {
        this._logLevel = level
    }

}


export function Formatting(message:string): string {
    let match = /<[a-zA-Z]*>/g
    let infoStart = match.exec(message)
    if (infoStart === null) return message
    let endMatch = new RegExp(infoStart[0].replace(/^</, '</'), 'g')
    let infoEnd = endMatch.exec(message.slice(infoStart.index + infoStart[0].length))
    if (infoEnd === null) return message.slice(0,infoStart.index+infoStart[0].length)+(Formatting(message.slice(infoStart.index+infoStart[0].length)))
    infoEnd.index += infoStart[0].length+infoStart.index
    let method = infoStart[0].replace(/^</, '').replace(/>$/, '')
    let replacement = message.slice(infoStart.index+infoStart[0].length, infoEnd.index)
    replacement = Formatting(replacement)
    replacement = log.Colors(method)(replacement)
    return Formatting(message.slice(0, infoStart.index)+replacement+message.slice(infoEnd.index+infoEnd[0].length))
}


export function ConvertToString(obj: any, newLineStart:string="") {
    let message:String;

    
    if (!(obj instanceof String || typeof obj == 'string')){
        message = inspect(obj).toString()
    }
    else {
        message = obj
    }
    let lines = message.split("\n")
    let result = ""
    if (newLineStart) newLineStart += " "
    for (let i = 0; i < lines.length; i++){
        result += `${newLineStart}${Formatting(lines[i])}\n`
    }
    return result
}