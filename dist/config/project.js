"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatus = void 0;
const fs_1 = require("fs");
const logging_1 = __importDefault(require("../logging"));
const process_1 = require("process");
const path_1 = __importDefault(require("path"));
const path_2 = require("../helper/path");
const server_1 = __importDefault(require("./server"));
const log = new logging_1.default('Config(project)');
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["initialized"] = 8] = "initialized";
    ProjectStatus[ProjectStatus["suspended"] = 4] = "suspended";
    ProjectStatus[ProjectStatus["active"] = 2] = "active";
    ProjectStatus[ProjectStatus["inactive"] = 1] = "inactive";
})(ProjectStatus = exports.ProjectStatus || (exports.ProjectStatus = {}));
class ProjectConfig {
    constructor() {
        this.Status = ProjectStatus.initialized;
        this.Name = "";
        this.Path = "";
        this.Servers = [];
    }
    GetServers() {
        log.Debug(`Fetching servers for project ${this.Name}`);
        this.Servers = server_1.default.LoadServersForProject(this.Name);
    }
    Save(project) {
        try {
            let _a = this.toJSON(), { Path, Name } = _a, projectConfig = __rest(_a, ["Path", "Name"]);
            Path = Path ? Path : path_1.default.join(ProjectConfig.Directory(), project !== null && project !== void 0 ? project : Name);
            Path = (0, path_2.ResolveUri)(Path);
            (0, fs_1.writeFileSync)(Path, JSON.stringify(projectConfig, (key, val) => { if (val !== undefined)
                return val; }, 4), { flag: "a+" });
        }
        catch (err) {
            log.Error("Failed to save project configuration");
            log.Error(err.message);
            log.Trace(err);
            (0, process_1.exit)(1);
        }
    }
    static LoadByName(project) {
        try {
            let dirPath = this.Directory();
            let dirs = this.ListProjectNames();
            if (!dirs.includes(project)) {
                return null;
            }
            let projectConfigFilePath = path_1.default.join(dirPath, project, 'project.json');
            let projectConfig;
            if (!(0, fs_1.existsSync)(projectConfigFilePath))
                projectConfig = new ProjectConfig();
            else
                projectConfig = this.fromJSON((0, fs_1.readFileSync)(projectConfigFilePath).toString());
            projectConfig.Name = project;
            projectConfig.Path = path_1.default.join(dirPath, project);
            projectConfig.GetServers();
            return projectConfig;
        }
        catch (err) {
            log.Log("Failed to load project configuration");
            log.Log(err);
            return null;
        }
    }
    static Init(project) {
        try {
            let projectConfig = new ProjectConfig();
            projectConfig.Name = project;
            let projectPath = path_1.default.join(ProjectConfig.Directory(), project);
            if (!(0, fs_1.existsSync)(projectPath)) {
                (0, fs_1.mkdirSync)(projectPath, { recursive: true });
            }
            projectConfig.Path = path_1.default.join(projectPath, "project.json");
            log.Debug(`Initiating a new project.json file for for the new project ${project}`);
            projectConfig.Save();
            log.Debug(`project.json file initialization completed successfully`);
        }
        catch (err) {
            log.Error(`An error occurred during the process of the initialization of the ProjectConfig for project ${project}`);
            log.Error(err.message);
            log.Trace(err);
            (0, process_1.exit)(1);
        }
    }
    toJSON() {
        return {
            Name: this.Name,
            Status: ProjectStatus[this.Status],
            Path: this.Path.replace((0, path_2.ResolveUri)('~'), '~'),
        };
    }
    static fromJSON(jsonData) {
        var _a;
        log.Trace({ "Parsing Project from JSON": jsonData });
        try {
            let jsonParsed = JSON.parse(jsonData);
            log.Trace({ jsonData });
            let tmp = new ProjectConfig();
            try {
                switch ((_a = jsonParsed === null || jsonParsed === void 0 ? void 0 : jsonParsed.Status) !== null && _a !== void 0 ? _a : "inactive") {
                    case "active":
                        tmp.Status = ProjectStatus.active;
                        break;
                    case "inactive":
                        tmp.Status = ProjectStatus.inactive;
                        break;
                    case "suspended":
                        tmp.Status = ProjectStatus.suspended;
                        break;
                    case "initialized":
                        tmp.Status = ProjectStatus.initialized;
                        break;
                    default:
                        tmp.Status = ProjectStatus.inactive;
                        break;
                }
            }
            catch (_b) {
                tmp.Status = ProjectStatus.inactive;
            }
            if ("Path" in jsonParsed) {
                tmp.Path = (0, path_2.ResolveUri)(jsonParsed.Path);
            }
            tmp.GetServers();
            return tmp;
        }
        catch (err) {
            log.Error("Errors encountered whilst parsing Project from JSON");
            log.Error(err);
            (0, process_1.exit)(1);
        }
    }
    static InitProjectConfig() {
        let projectsPath = (0, path_2.ResolveUri)("~/.config/admiral/projects");
        if (!(0, fs_1.existsSync)(projectsPath)) {
            (0, fs_1.mkdirSync)(projectsPath, { recursive: true });
        }
        return projectsPath;
    }
    static Directory() {
        let projectsPath = (0, path_2.ResolveUri)("~/.config/admiral/projects");
        ProjectConfig.InitProjectConfig();
        return projectsPath;
    }
    static ListProjectNames(options) {
        let path = ProjectConfig.Directory();
        let projectDirContent = (0, fs_1.readdirSync)(path, { withFileTypes: true });
        let dirs = projectDirContent.filter((d) => d.isDirectory());
        let res = dirs.map((d) => (options && options.withFileTypes) ? d : d.name);
        return res;
    }
    static GetProjects(options) {
        let projects = ProjectConfig.ListProjectNames()
            .map(p => ProjectConfig.LoadByName(p))
            .filter(p => p !== null)
            .map(p => p);
        if (options && 'status' in options)
            return projects.filter(p => p !== null && (p.Status & options.status) > 0);
        return projects;
    }
}
exports.default = ProjectConfig;
//# sourceMappingURL=project.js.map