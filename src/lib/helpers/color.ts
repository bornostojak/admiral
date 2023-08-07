import chalk, { Chalk } from 'chalk'

export default class Color {

    public static Colors(method:string, noColor: boolean = false) {
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
        if (!(method in options) || noColor) return (m:string) => m
        return (m:string) => (options[method] as Chalk)(m)
    } 
    public static Coloring(message: string, options?: { noColor: boolean }): string {
        let match = /<[a-zA-Z]*>/g
        let infoStart = match.exec(message)
        if (infoStart === null) return message
        let endMatch = new RegExp(infoStart[0].replace(/^</, '</'), 'g')
        let infoEnd = endMatch.exec(message.slice(infoStart.index + infoStart[0].length))
        if (infoEnd === null) return message.slice(0,infoStart.index+infoStart[0].length)+(Color.Coloring(message.slice(infoStart.index+infoStart[0].length), options))
        infoEnd.index += infoStart[0].length+infoStart.index
        let method = infoStart[0].replace(/^</, '').replace(/>$/, '')
        let replacement = message.slice(infoStart.index+infoStart[0].length, infoEnd.index)
        replacement = Color.Coloring(replacement, options)
        replacement = Color.Colors(method, options?.noColor ?? false)(replacement)
        return Color.Coloring(message.slice(0, infoStart.index)+replacement+message.slice(infoEnd.index+infoEnd[0].length), options)
    }
}