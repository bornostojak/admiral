import fs, { existsSync, mkdirSync } from 'fs'
import yargs, { Options } from 'yargs'
import logging from '../../logging.js'
import { exit } from 'process'
import { Status } from '../../lib/status.js'
import ProjectConfig from '../../lib/project.js'
import path from 'path'

let log = new logging("Project(init)")

export const CommandOptions : Record<string, Options> = {
    "help": {boolean: true, alias: 'h'},
}

export function ProcessCommand(args: string[]) {
    log.Trace({ project_init: args })
    let parsedArgs = yargs.help(false).options(CommandOptions).parse(args)
    let command: string = parsedArgs?._.slice(0, 1).join('')
    let subcommand: string = parsedArgs?._.slice(1, 2).join('')

    if (parsedArgs._.length > 2) {
        log.Error("<red><b>Multiple project names specified. Please run the command project by project, one by one</b></red>")
        exit(1)
    }

    if (subcommand == 'help' || parsedArgs?.help || (parsedArgs?._.length == 1 && args.length == 1)) {
        PrintHelp()
        exit(0)
    }

    let projectName = String(parsedArgs._[1])
    
    if (ProjectConfig.ListProjectNames().includes(projectName)) {
        log.Error(`<b>Project <red><b>${projectName}</b></red> already exists</b>`)
        exit(1)
    }

    let projectPath = path.join(ProjectConfig.Directory(), projectName)
    
    if (existsSync(projectPath)) {
        log.Error(`<b>Project <red><b>${projectName}</b></red> already initiated</b>`)
        exit(1)
    }

    log.Debug(`Initiation new project: ${projectName}`)
    log.Debug(`New project location: ${projectPath}`)

    try {
        fs.mkdirSync(projectPath, { recursive: true })
        fs.mkdirSync(path.join(projectPath, "scripts"), { recursive: true })
        fs.mkdirSync(path.join(projectPath, "shared"), { recursive: true })
        fs.mkdirSync(path.join(projectPath, "servers"), { recursive: true })
        fs.mkdirSync(path.join(projectPath, "stacks"), { recursive: true })
        fs.mkdirSync(path.join(projectPath, "environment"), { recursive: true })
        fs.writeFileSync(path.join(projectPath, "notes.json"), "", { flag: 'w+' })
        fs.writeFileSync(path.join(projectPath, "upgrade.json"), "", { flag: 'w+' })
        fs.writeFileSync(path.join(projectPath, "environment/production.env"), "", { flag: 'w+' })
        fs.writeFileSync(path.join(projectPath, "environment/staging.env"), "", { flag: 'w+' })
        fs.writeFileSync(path.join(projectPath, "environment/theater.env"), "", { flag: 'w+' })
    } catch(err) {
        log.Error("<b>An error occurred during the attempt to create the new project:</b>")
        log.Error((err as Error).message)
        log.Trace(err)
        exit(1)
    }
    log.Debug(`<green>Initiation successful, new project created: ${projectName}<green>`)
    log.Debug(`Starting the creation of the project config...`)
    ProjectConfig.Init(projectName)
    log.Print(`<green>Successfully initialized new project: <cyan><b>${projectName}</b></cyan></green>`)

    exit(0)
}


function PrintHelp() {
    let help = log.Prefix('Help')
    help.Print('    <red>project init</red> [OPTIONS] <b><cyan><PROJECT></cyan></b>')
    help.Print('')
    help.Print('DESCRIPTION:')
    help.Print('    Create a new project.')
    help.Print('')
    help.Print('OPTIONS:')
    help.Print('    -h, --help                 print help')
    help.Print('')
}
