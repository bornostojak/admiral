import logging from "../logging.js"
import yargs from "yargs/yargs"
import yargsParsed, { Options } from "yargs"

import { ProcessCommandSync as SelectProcessCommandSync} from "./select"

const log = new logging("Command Parser")



export default function ProcessArguments(args:string[]) {
    let parsedArgs = Object(yargs(args).help(false).argv)
    let command = parsedArgs._.slice(0,1).join('')
    if (command === 'help') {
        PrintHelp()
    }
    switch (command) {
        case 'select':
            SelectProcessCommandSync(args.slice(1))
            break;
        case 'deselect':
            SelectProcessCommandSync(['--deselect'])
            break;
    }
    let subcommands = parsedArgs._.slice(1)
    delete parsedArgs["$0"]
    delete parsedArgs["_"]

    log.Trace({command, subcommands, options: parsedArgs})

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