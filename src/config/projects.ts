import fs, { existsSync, mkdirSync, readdirSync } from 'fs'
import { GetLocalConfigLocation } from './manager'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'
import { ResolveUri } from '../helper/path'

const log = new logging('Project configuration')

export class ProjectConfig {
    
    
    public static Directory() {
        let projectsPath = ResolveUri("~/.config/derrik/projects")
        if (!existsSync(projectsPath)) {
            mkdirSync(projectsPath, { recursive: true })
        }
        return projectsPath
    }

    public static List(options: { withFileTypes: boolean } & { withFileTypes: true }): fs.Dirent[];
    public static List(options: { withFileTypes: boolean } & { withFileTypes: false }): string[];
    public static List(): string[];
    public static List(options?: { withFileTypes: boolean }): (fs.Dirent | string)[] {
        let path = this.Directory()
        let projectDirContent = readdirSync(path, { withFileTypes: true })
        let dirs = projectDirContent.filter((d) => d.isDirectory())
        let res = dirs.map((d) => (options && options.withFileTypes) ? d : d.name )
        return res
    }
}