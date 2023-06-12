"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deselect = exports.DeselectSync = exports.Select = exports.ProcessCommand = exports.CommandOptions = void 0;
const logging_1 = __importDefault(require("../../logging"));
const process_1 = require("process");
const yargs_1 = __importDefault(require("yargs"));
const project_1 = __importDefault(require("../../config/project"));
const status_1 = require("../../config/status");
let log = new logging_1.default("Select command");
const DESELECT_SYMBOL = "^";
const DESELECT_REGEX = /^\^/;
const SELECT_SYMBOL = "+";
const SELECT_REGEX = /^\+/;
exports.CommandOptions = {
    "all": { boolean: true, alias: 'a' },
    "help": { boolean: true, alias: 'h' },
    "active": { boolean: true, alias: 'a' },
    "deselect": { boolean: true, alias: 'd' },
    "line": { boolean: true, alias: 'l' },
};
function ProcessCommand(args) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ select_args: args });
        let parsedArgs = yargs_1.default.help(false).options(exports.CommandOptions).parse(args);
        let command = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._[0].toString();
        let projects = (_b = yield processProjectsString((_a = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._.slice(1).join(',')) === null || _a === void 0 ? void 0 : _a.toString())) !== null && _b !== void 0 ? _b : null;
        let select = (_c = projects.filter(p => !p.startsWith('^')).map(p => p.replace(SELECT_REGEX, ''))) !== null && _c !== void 0 ? _c : [];
        let deselect = select.length > 0 ? [] : (_e = (_d = projects === null || projects === void 0 ? void 0 : projects.filter(p => p.startsWith('^'))) === null || _d === void 0 ? void 0 : _d.map(p => p.replace(DESELECT_REGEX, ''))) !== null && _e !== void 0 ? _e : [];
        let status = status_1.Status.Load();
        log.Prefix("SELECTION").Trace({ command, projectsString: (_f = parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs._[1]) === null || _f === void 0 ? void 0 : _f.toString(), select, deselect, initialStatus: status });
        if (command == "select" && (deselect.length > 0 && select.length == 0)) {
            log.Debug("Force deselecting");
            command = 'deselect';
        }
        if (parsedArgs.help || args.length == 1) {
            if (command === "deselect" || args[0] == "deselect") {
                PrintHelpDeselect();
                (0, process_1.exit)(0);
            }
            if (command === "select" || args[0] === "select") {
                PrintHelp();
                (0, process_1.exit)(0);
            }
        }
        if (parsedArgs.active) {
            if (((_g = status === null || status === void 0 ? void 0 : status.Active) === null || _g === void 0 ? void 0 : _g.length) > 0) {
                log.Trace("Printing active projects");
                if (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.line) {
                    log.Print(`${(_h = status === null || status === void 0 ? void 0 : status.Active) === null || _h === void 0 ? void 0 : _h.map(a => `<green>${a.toString()}</green>`).join("\n")}`);
                    (0, process_1.exit)(0);
                }
                log.Print(`<green><b>Active projects</b>:</green> ${(_j = status === null || status === void 0 ? void 0 : status.Active) === null || _j === void 0 ? void 0 : _j.join(", ")}`);
                (0, process_1.exit)(0);
            }
            log.Print("<red>There are currently no active projects</red>");
            (0, process_1.exit)(1);
        }
        if (parsedArgs.deselect || command === 'deselect') {
            log.Debug("Deselecting...");
            let completeDeselection = [...new Set([...select, ...deselect])].filter(p => { var _a; return (_a = status === null || status === void 0 ? void 0 : status.Active) === null || _a === void 0 ? void 0 : _a.includes(p); });
            log.Trace({ deselect: completeDeselection });
            yield Deselect(completeDeselection, status);
            (0, process_1.exit)(0);
        }
        if (parsedArgs.all) {
            log.Debug("Selecting all projects");
            //select = GetProjectsFileSync().map(p => p?.name).filter(p => !deselect.includes(p))
            select = project_1.default.ListProjectNames().filter(p => !deselect.includes(p));
            log.Trace({ projectsAfterSelectAll: projects });
        }
        if (select.length == 0) {
            yield promptForProjects();
            (0, process_1.exit)(0);
        }
        log.Debug("Selecting projects");
        log.Trace({ select });
        yield Select(select);
        if ((deselect === null || deselect === void 0 ? void 0 : deselect.length) > 0) {
            log.Debug("Entering deselect");
            log.Trace({ deselect });
            yield Deselect(deselect);
        }
        (0, process_1.exit)(0);
    });
}
exports.ProcessCommand = ProcessCommand;
function processProjectsString(projectsString) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (!projectsString)
            return [];
        log.Trace({ projectsString });
        let projects = (projectsString === null || projectsString === void 0 ? void 0 : projectsString.includes(SELECT_SYMBOL)) ? (_b = (_a = status_1.Status.Load()) === null || _a === void 0 ? void 0 : _a.Active) !== null && _b !== void 0 ? _b : [] : [];
        let existingProjects = project_1.default.ListProjectNames();
        projects = [...projects, ...projectsString === null || projectsString === void 0 ? void 0 : projectsString.split(',').map(f => f === 'all' ? existingProjects : f).flat()
        ];
        return projects.filter((val, pos) => projects.indexOf(val) == pos
            && !projectsString.includes(`${SELECT_SYMBOL}${val}`)
            && !projectsString.includes(`${DESELECT_SYMBOL}${val}`));
    });
}
function Select(projects, status) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!status) {
            status = status_1.Status.Load();
        }
        yield validateSelection(projects);
        status.Active = projects;
        status_1.Status.Save(status);
        log.Print(`<green><b>Projects selected:</b></green> ${projects.join(', ')}`);
    });
}
exports.Select = Select;
/**
 * Prompt the user to select a project from all existing projects
 */
function promptForProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        log.Debug("Going into project selection prompt");
        //TODO: prompt for existing projects
    });
}
function validateSelection(projects) {
    return __awaiter(this, void 0, void 0, function* () {
        log.Debug('Validating selection...');
        log.Trace({ projects });
        try {
            let definedProjects = project_1.default.ListProjectNames();
            if (!(definedProjects instanceof Array)) {
                log.Debug('<red>Validation FAILED.</red>');
                log.Error("Wrong syntax in <red>projects.json</red>!");
                (0, process_1.exit)(1);
            }
            let undefinedProjects = projects === null || projects === void 0 ? void 0 : projects.filter(project => !definedProjects.includes(project));
            if ((undefinedProjects === null || undefinedProjects === void 0 ? void 0 : undefinedProjects.length) > 0) {
                log.Debug('<red>Validation FAILED.</red>');
                log.Print(`<yellow>Undefined projects:</yellow> <b>${undefinedProjects.join(", ")}</b>`, true);
                (0, process_1.exit)(1);
            }
        }
        catch (err) {
            log.Debug('<red>Validation FAILED.</red>');
            log.Error(`An error occurred during validation. Check the <b><red>projects.json</red></b> file in your local configs`);
            log.Trace({ err });
            (0, process_1.exit)(1);
        }
        log.Debug('<green>Validation successful.</green>');
    });
}
function DeselectSync(projects, status = status_1.Status.Load()) {
    var _a;
    log.Trace({ status, project: projects });
    if (((_a = status === null || status === void 0 ? void 0 : status.Active) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        log.Print("No project is currently active, nothing to do", true);
        return;
    }
    if (projects && projects.length > 0) {
        let active = status.Active instanceof Array ? status.Active : [status.Active];
        projects.forEach(p => {
            if (!active.includes(p))
                log.Print(`<red><b>Not active:</b></red> ${p}`, true);
        });
        let finalDeselection = active === null || active === void 0 ? void 0 : active.filter(a => projects.includes(a));
        if ((finalDeselection === null || finalDeselection === void 0 ? void 0 : finalDeselection.length) > 0)
            log.Print(`<yellow><b>Deselecting projects:</b></yellow> ${finalDeselection.join(', ')}`, true);
        status.Active = active.filter(p => !projects.includes(p));
        status_1.Status.Save(status);
        return;
    }
    status.Active = [];
    status_1.Status.Save(status);
    log.Print('All projects have been deselected', true);
}
exports.DeselectSync = DeselectSync;
function Deselect(projects, status = status_1.Status.Load()) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        log.Trace({ status, project: projects });
        if (((_a = status === null || status === void 0 ? void 0 : status.Active) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            log.Print("No project is currently active, nothing to do", true);
            return;
        }
        if (projects && projects.length > 0) {
            let active = status.Active instanceof Array ? status.Active : [status.Active];
            projects.forEach(p => {
                if (!active.includes(p))
                    log.Print(`<red><b>Not active:</b></red> ${p}`, true);
            });
            let finalDeselection = active === null || active === void 0 ? void 0 : active.filter(a => projects.includes(a));
            if ((finalDeselection === null || finalDeselection === void 0 ? void 0 : finalDeselection.length) > 0)
                log.Print(`<yellow><b>Deselecting projects:</b></yellow> ${finalDeselection.join(', ')}`, true);
            status.Active = active.filter(p => !projects.includes(p));
            status_1.Status.Save(status);
            return;
        }
        status.Active = [];
        status_1.Status.Save(status);
        log.Print('All projects have been deselected', true);
    });
}
exports.Deselect = Deselect;
function PrintHelp() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('  <red>admiral project select</red> [OPTIONS]');
    help.Print('  <red>admiral project select</red> PROJECT [OPTIONS]');
    help.Print('  <red>admiral project select</red> PROJECT1,PROJECT2,.. [OPTIONS]');
    //log.Print('')
    //log.Print('  special case:')
    help.Print('  <red>admiral project select</red> <b><green>all</green></b>,... [OPTIONS]');
    help.Print('  <red>admiral project select</red> <b><green>+PROJECT1</green></b>,<b><blue>^PROJECT2</blue></b>... [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('  Select one or multiple projects and designate them as <red>active</red>');
    help.Print('  All projects can be selected using the <b><green>all</green></b> keyword.');
    help.Print('  Adding <b><green>+</green></b> in front of the project name will <green>add</green> it to the selection.');
    help.Print('  Adding <b><blue>^</blue></b> in front of the project name will <blue>remove</blue> ait to the selection.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print(`  -a, --all         - select all available projects`);
    help.Print(`  -d, --deselect    - deselect the currently active project`);
    help.Print(`  -h, --help        - print the help message`);
    help.Print(`  -l, --list        - list the active projects line by line`);
    help.Print(`  -s, --active      - show the current active project`);
    help.Print('');
    help.Print('ALIASED:');
    help.Print(`  <red>select</red>     -> <red>project select</red>`);
    help.Print(`  <red>selected</red>   -> <red>project select -s</red>`);
    help.Print(`  <red>active</red>     -> <red>project select -s</red>`);
    help.Print(`  <red>a</red>          -> <red>project select -s</red>`);
    help.Print('');
}
function PrintHelpDeselect() {
    let help = log.Prefix('Help');
    help.Print('USAGE:');
    help.Print('  <red>admiral project deselect</red> [OPTIONS]');
    help.Print('  <red>admiral project deselect</red> <PROJECT> [OPTIONS]');
    help.Print('  <red>admiral project deselect</red> <PROJECT1>,<PROJECT2>,.. [OPTIONS]');
    help.Print('');
    help.Print('DESCRIPTION:');
    help.Print('  Deselect specific projects or all projects.');
    help.Print('');
    help.Print('OPTIONS:');
    help.Print(`  -h, --help        - print the help message`);
    help.Print('');
}
//# sourceMappingURL=select.js.map