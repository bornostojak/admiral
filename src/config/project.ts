import fs, { existsSync, mkdirSync, readFileSync, readSync, readdirSync, writeFile, writeFileSync } from 'fs'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'
import { ResolveUri } from '../helper/path'

const log = new logging('Config(project)')

export enum ProjectStatus {
    suspended = 4,
    active = 2,
    inactive = 1,
}

export default class ProjectConfig {

    public Status: ProjectStatus = ProjectStatus.inactive;
    public Name: string = ""
    public Path: string = ""
    
    private constructor() {

    }


    public Save(project?: string): void {
        try {
            let { Path, Name, ...projectConfig } = this.toJSON()
            Path = Path ? Path : path.join(ProjectConfig.Directory(), project ?? Name)
            writeFileSync(Path, JSON.stringify(projectConfig, (key, val) => { if (val !== undefined) return val }, 4))
        } catch (err) {
            log.Log("Failed to save project configuration")
            log.Log(err)
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
            let projectConfigFilePath = path.join(dirPath, project, 'project.json')
            let projectConfig: ProjectConfig;
            if (!existsSync(projectConfigFilePath))
                projectConfig = new ProjectConfig()
            else
                projectConfig = this.fromJSON(readFileSync(projectConfigFilePath).toString())
            projectConfig.Name = project
            projectConfig.Path = path.join(dirPath, project)
            return projectConfig
        } catch (err) {
            log.Log("Failed to load project configuration")
            log.Log(err)
            return null
        }

    }

    public toJSON() {
        return {
            Name: this.Name,
            Status: ProjectStatus[this.Status],
            Path: this.Path.replace(ResolveUri('~'), '~')
        }
    }

    private static fromJSON(jsonData: string): ProjectConfig {
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
        return tmp
    }

    public static Directory() {
        let projectsPath = ResolveUri("~/.config/admiral/projects")
        if (!existsSync(projectsPath)) {
            mkdirSync(projectsPath, { recursive: true })
        }
        return projectsPath
    }

    public static ListProjectNames(options: { withFileTypes: boolean } & { withFileTypes: true }): fs.Dirent[];
    public static ListProjectNames(options: { withFileTypes: boolean } & { withFileTypes: false }): string[];
    public static ListProjectNames(): string[];
    public static ListProjectNames(options?: { withFileTypes: boolean }): (fs.Dirent | string)[] {
        let path = this.Directory()
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