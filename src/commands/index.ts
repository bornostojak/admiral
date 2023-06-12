import logging from "../logging.js"
import yargs from "yargs/yargs"
import yargsParsed, { Options } from "yargs"

import * as Select from './select'
import * as Deploy from './deploy'
import * as Service from './service'
import * as List from './list'
import * as Server from './server/index'
import * as Project from './project/index'

import * as jsonHelpers from './helpers/json'
import { SSHCredentials } from "../config/ssh.js"
import Config from "../config/manager.js"
 
const log = new logging("Command Parser")



export default async function ProcessArguments(args:string[]) {
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
        case "a":
        case "active":
        case "selected":
            Select.ProcessCommand(['select', '-s', ...args.filter(f => f != 'select')])
            break
        case "deploy":
            await Deploy.ProcessCommand(args)
            break
        case "ds":
            await Select.ProcessCommand(["deselect", "all"])
            break
        case "deselect":
            await Select.ProcessCommand(args)
            break
        case "list":
            await List.ProcessCommand(args)
            break
        case "select":
            await Select.ProcessCommand(args)
            break
        case "project":
            await Project.ProcessCommand(args)
            break
        case "server":
            await Server.ProcessCommand(args)
            break
        case "service":
            await Service.ProcessCommand(args)
            break
        case "test":
            let conf = await Config.GetLocalConfig()
            log.Print(new SSHCredentials(conf.ssh).SSH2Login())
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
    log.Print(`  <b><red>${command}</red></b> <b><u>is not</u></b> a recognized command!`)
    log.Print()
    log.Print(`To see all available commands, run:\n  <red>${run} help</red>`)
    log.Print()
    process.exit(1)
}


export function PrintHelp() {
    //TODO: print help
    
    log.Print("USAGE")
    log.Print("    <red>mob</red> [OPTIONS] COMMAND [ARGS]")
    log.Print()
    log.Print("DESCRIPTION")
    log.Print("    <red>mob</red> (a.k.a motherbee) is a command line program with the intention of making")
    log.Print("    the distribution, adjustment and deployment of one docker swarm codebase to multiple projects")
    log.Print("    easier, streamlined and sysadmin friendly. We will tear or hairs out, so you don't have to.")
    log.Print()
    log.Print("COMMANDS")
    log.Print("  Basics:")
    log.Print("    <red>deselect, ds</red>            deselect one or more currently active projects")
    log.Print("    <red>list</red>                    list additional information")
    log.Print("    <red>select</red>                  select one or more projects as active")
    log.Print()
    log.Print("  Management:")
    log.Print("    <red>project</red>                 manage projects")
    log.Print("    <red>rack</red>                    manage racks")
    log.Print("    <red>server</red>                  manage servers")
    log.Print("    <red>service</red>                 manage services")
    log.Print()
    log.Print("  Info:")
    log.Print("    <red>selected, active, a</red>     print out active projects")
    log.Print()
    log.Print("  Serialization:")
    log.Print("    <red>serialize</red>               serialize the current state of the stack")
    log.Print()

    process.exit(0)

}