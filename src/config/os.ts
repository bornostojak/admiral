import fs, { existsSync, readFileSync, readdirSync } from 'fs'
import { GetLocalConfigLocation } from './manager'
import logging from '../logging'
import { exit } from 'process'
import path from 'path'
import { Status } from './status'
import { type } from 'os'
import { array } from 'yargs'
import { LocalConfig } from '.'
import ProjectConfig from './project'
import { ResolveUri } from '../helper/path'
import { LocalProjectDirectory } from '../commands/project/list'

const log = new logging('Servers')


export interface IOperatingSystem {
    Name:         string;
    OS:           string;
    Image:        string;
    Distribution: string;
    Version:      string;
    Dependencies: Dependencies;
    Groups:       GroupConfig[];
    Users:        UserConfig[];
}

export interface Dependencies {
    [key: string]: string
}


export interface GroupConfig {
    Name:      string;
    Gid:       string;
    Superuser: boolean;
}

export interface UserConfig {
    Name:      string;
    Uid:       string;
    Superuser: boolean;
    Groups:    string[];
    Password:  string;
    Home:      string;
}



export default class OperatingSystem implements IOperatingSystem {
    Name: string = ""
    Image: string = ""
    OS: string = ""
    Distribution: string = ""
    Version: string = ""
    Dependencies: Dependencies = {}
    Groups: GroupConfig[] = []
    Users: UserConfig[] = []
    

    constructor() {
        
    }
    
    public static Init() {
        let tmp = new OperatingSystem()
    }

    
}