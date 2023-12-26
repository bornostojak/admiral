import fs, { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import logging from '../../logging'
import { exit } from 'process'
import path from 'path'
import { ResolveUri } from '../helpers/path'
import Server from '../server'
import yaml from 'js-yaml'

import ProjectEnvironment from './environment'

const log = new logging('Config(project)')

export enum ProjectStatus {
    initialized = 8,
    suspended = 4,
    active = 2,
    inactive = 1,
}

export default class ProjectConfig {

    public Status: ProjectStatus = ProjectStatus.initialized;
    public Name: string = ""
    public Path: string = ""
    public Servers: Server[] = []
    
    public Environments: ProjectEnvironment[] = []
    
    private constructor() {

    }


    public GetServers() {
        log.Debug(`Fetching servers for project ${this.Name}`)
        this.Servers = Server.LoadServersForProject(this.Name)
    }

    public Save(project?: string): void {
        try {
            let { Path, Name, ...projectConfig } = this.toJSON()
            Path = Path ? Path : path.join(ProjectConfig.Directory(), project ?? Name)
            Path = ResolveUri(Path)
            // writeFileSync(Path, JSON.stringify(projectConfig, (key, val) => { if (val !== undefined) return val }, 4), { flag: "a+" })
            writeFileSync(Path, this.toYAML())
        } catch (err) {
            log.Error("Failed to save project configuration")
            log.Error((err as Error).message)
            log.Trace(err)
            exit(1)
        }
    }

    public static LoadByName(project: string): ProjectConfig | null {
        try {
            let dirPath = this.Directory()
            let dirs = this.ListProjectNames()
            if (!dirs.includes(project)) {
                return null
            }
            let projectConfigFilePath = path.join(dirPath, project, 'project.yaml')
            let projectConfig: ProjectConfig;
            if (!existsSync(projectConfigFilePath))
                projectConfig = new ProjectConfig()
            else
                projectConfig = this.fromYAML(readFileSync(projectConfigFilePath).toString())
            let envPath = path.join(dirPath, project, 'environments')
            if (fs.existsSync(envPath)) {
                projectConfig.Environments = fs.readdirSync(envPath, {withFileTypes: true})
                    .filter(e => e.isDirectory() && fs.existsSync(path.join(envPath, e.name, 'environment.yaml')))
                    .map(e => ProjectEnvironment.Load(path.join(envPath, e.name)))
            }
            projectConfig.Name = project
            projectConfig.Path = path.join(dirPath, project)
            projectConfig.GetServers()
            return projectConfig
        } catch (err) {
            log.Log("Failed to load project configuration")
            log.Error(err)
            return null
        }

    }
    

    public static Init(project: string) {
        try {
            let projectConfig = new ProjectConfig()
            projectConfig.Name = project
            let projectPath = path.join(ProjectConfig.Directory(), project)
            if (!existsSync(projectPath)) {
                mkdirSync(projectPath, { recursive: true })
            }
            projectConfig.Path = path.join(projectPath, "project.json")
            log.Debug(`Initiating a new project.json file for for the new project ${project}`)
            projectConfig.Save()
            log.Debug(`project.json file initialization completed successfully`)
        } catch(err) {
            log.Error(`An error occurred during the process of the initialization of the ProjectConfig for project ${project}`)
            log.Error((err as Error).message)
            log.Trace(err)
            exit(1)
        }
    }

    public toJSON() {
        return {
            Name: this.Name,
            Status: ProjectStatus[this.Status],
            Path: this.Path.replace(ResolveUri('~'), '~'),
        }
    }
    
    private toYAML() {
        let tmp = {
            status: this.Status
        }
        return yaml.dump(tmp, { indent: 2 })
    }

    private static fromYAML(yamlData: string): ProjectConfig {
        log.Trace({ "Parsing Project from YAML": yamlData })
        try {
            let yamlParsed = yaml.load(yamlData) as { [key: string]: any }
            log.Trace({ yamlData: yamlData })
            let tmp = new ProjectConfig()
            try {
                switch (yamlParsed?.status ?? "inactive") {
                    case "active":
                        tmp.Status = ProjectStatus.active
                        break
                    case "inactive":
                        tmp.Status = ProjectStatus.inactive
                        break
                    case "suspended":
                        tmp.Status = ProjectStatus.suspended
                        break
                    case "initialized":
                        tmp.Status = ProjectStatus.initialized
                        break
                    default:
                        tmp.Status = ProjectStatus.inactive
                        break
                }
            } catch {
                tmp.Status = ProjectStatus.inactive
            }
            if ("Path" in yamlParsed) {
                tmp.Path = ResolveUri(yamlParsed.Path)
            }
            tmp.GetServers()
            return tmp
        } catch(err) {
            log.Error("Errors encountered whilst parsing Project from JSON")
            log.Error(err)
            exit(1)
        }
    }
    private static fromJSON(jsonData: string): ProjectConfig {
        log.Trace({ "Parsing Project from JSON": jsonData })
        try {
            let jsonParsed = JSON.parse(jsonData)
            log.Trace({ jsonData })
            let tmp = new ProjectConfig()
            try {
                switch (jsonParsed?.Status ?? "inactive") {
                    case "active":
                        tmp.Status = ProjectStatus.active
                        break
                    case "inactive":
                        tmp.Status = ProjectStatus.inactive
                        break
                    case "suspended":
                        tmp.Status = ProjectStatus.suspended
                        break
                    case "initialized":
                        tmp.Status = ProjectStatus.initialized
                        break
                    default:
                        tmp.Status = ProjectStatus.inactive
                        break
                }
            } catch {
                tmp.Status = ProjectStatus.inactive
            }
            if ("Path" in jsonParsed) {
                tmp.Path = ResolveUri(jsonParsed.Path)
            }
            tmp.GetServers()
            return tmp
        } catch(err) {
            log.Error("Errors encountered whilst parsing Project from JSON")
            log.Error(err)
            exit(1)
        }
    }

    public static InitProjectConfig() {
        let projectsPath = ResolveUri("~/.config/admiral/projects")
        if (!existsSync(projectsPath)) {
            mkdirSync(projectsPath, { recursive: true })
        }
        return projectsPath
    }
    public static Directory() {
        let projectsPath = ResolveUri("~/.config/admiral/projects")
        ProjectConfig.InitProjectConfig()
        return projectsPath
    }

    public static ListProjectNames(options: { withFileTypes: boolean } & { withFileTypes: true }): fs.Dirent[];
    public static ListProjectNames(options: { withFileTypes: boolean } & { withFileTypes: false }): string[];
    public static ListProjectNames(): string[];
    public static ListProjectNames(options?: { withFileTypes: boolean }): (fs.Dirent | string)[] {
        let path = ProjectConfig.Directory()
        let projectDirContent = readdirSync(path, { withFileTypes: true })
        let dirs = projectDirContent.filter((d) => d.isDirectory())
        let res = dirs.map((d) => (options && options.withFileTypes) ? d : d.name)
        return res
    }

    public static GetProjects(options: { status: ProjectStatus }): ProjectConfig[];
    public static GetProjects(): ProjectConfig[];
    public static GetProjects(options?: { status: ProjectStatus }): ProjectConfig[] {
        let projects = ProjectConfig.ListProjectNames()
            .map(p => ProjectConfig.LoadByName(p))
            .filter(p => p !== null)
            .map(p => p as ProjectConfig)
        if (options && 'status' in options)
            return projects.filter(p => p !== null && (p.Status & options.status) > 0)
        return projects
    }
}