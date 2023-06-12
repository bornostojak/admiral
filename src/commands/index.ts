import logging from "../logging.js"
import yargs from "yargs/yargs"
import yargsParsed, { Options } from "yargs"

import * as Select from './select'
import Module from "module"

const log = new logging("Command Parser")



export default function ProcessArguments(args:string[]) {
    let parsedArgs = Object(yargs(args).help(false).argv)
    let command = parsedArgs._.slice(0,1).join('')
    let subcommands = parsedArgs._.slice(1)
    delete parsedArgs["$0"]
    delete parsedArgs["_"]
    log.Trace({command, subcommands, options: parsedArgs})
    if (command === 'help') {
        PrintHelp()
    }
    switch (command) {
        case "select":
            Select.ProcessCommand(args)
            break
        case "deselect":
            Select.ProcessCommand(args)
            break
        default:
            commandNotFound(command)
            break
    }
}

function commandNotFound(command:string) {
    let run = process.argv[0].split('/').slice(-1).join('') === 'node'
        ? process.argv.slice(0,2).map(f => f.split('/').slice(-1).join('')).join(' ')
        : process.argv[0].split('/').slice(-1).join('')
    log.Print("<b>MISSING COMMAND</b>")
    log.Print(`  <b><red>${command}</red></b> is NOT a recognized command!`)
    log.Print()
    log.Print(`To see all available commands, run:\n  <cyan>${run} help</cyan>`)
    log.Print()
    process.exit(1)
}


export function PrintHelp() {
    //TODO: print help




    process.exit(0)

}