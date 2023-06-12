"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertToString = exports.Formatting = void 0;
//import { Chalk } from 'chalk'
const process_1 = require("process");
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const logging_1 = __importDefault(require("./config/logging"));
var loggingConfig = logging_1.default.Load();
class log {
    constructor(prefix) {
        this._prefixes = [];
        if (!prefix)
            return;
        this._prefixes.push(prefix);
    }
    static rotBgColor(messages, joiner = '') {
        let parsed = [];
        messages = this._logLevel > 1 ? messages : messages.slice(0, 1);
        const colorWheel = [
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(167, 123, 76)(m)),
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(111, 211, 108)(m)),
            (m) => chalk_1.default.white(chalk_1.default.bgRgb(56, 77, 145)(m)),
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(133, 145, 98)(m)),
            (m) => chalk_1.default.white(chalk_1.default.bgRgb(79, 31, 222)(m)),
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(200, 99, 56)(m)),
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(214, 107, 189)(m)),
            (m) => chalk_1.default.black(chalk_1.default.bgRgb(156, 195, 15)(m))
        ];
        for (let i = 0; i < messages.length; i++) {
            parsed.push(colorWheel[i % colorWheel.length](log.op + messages[i] + log.ed + joiner));
        }
        return this._logLevel > 0 ? parsed.join(log._joint) + log._joint : '';
    }
    static Colors(method) {
        let options = {
            "red": chalk_1.default.red,
            "green": chalk_1.default.green,
            "blue": chalk_1.default.blue,
            "yellow": chalk_1.default.yellow,
            "magenta": chalk_1.default.magenta,
            "cyan": chalk_1.default.cyan,
            "white": chalk_1.default.white,
            "black": chalk_1.default.black,
            "b": chalk_1.default.bold,
            "i": chalk_1.default.italic,
            "u": chalk_1.default.underline,
        };
        if (!(method in options))
            return (m) => m;
        return (m) => options[method](m);
    }
    Prefix(prefix, chalk_method = chalk_1.default.bgMagenta) {
        let tmp = new log();
        tmp._prefixes = [...this._prefixes.map(s => s)];
        if (prefix)
            tmp._prefixes.push(prefix);
        return tmp;
    }
    Print(message = "", logMessage = false) {
        let text = (ConvertToString(message, log.rotBgColor(this._prefixes) + (log._depth == 0 ? '' : chalk_1.default.bgBlack(chalk_1.default.white(log.op + "PRINT" + log.ed + log._joint)))));
        log.write(text, process_1.stdout);
        if (logMessage)
            this.logToFile(message, '');
        return message;
    }
    Log(message = "") {
        let text = (ConvertToString(message, log.rotBgColor(this._prefixes) + (log._depth == 0 ? '' : chalk_1.default.bgBlack(chalk_1.default.white(log.op + "LOG" + log.ed + log._joint)))));
        this.logToFile(message, '');
        if (log._depth < 1)
            return;
        log.write(text, process_1.stdout);
    }
    Error(message = "") {
        let preString = chalk_1.default.bold(chalk_1.default.bgRed(log.op + "ERROR" + log.ed)) + log.rotBgColor(this._prefixes);
        let text = (ConvertToString(message, `${preString}`));
        log.write(text, process_1.stderr);
        this.logToFile(message, '');
    }
    Info(message = "") {
        let preString = log.rotBgColor(this._prefixes) + (log._depth == 0 ? '' : chalk_1.default.bgBlack(chalk_1.default.white(log.op + "INFO" + log.ed + log._joint)));
        let text = (ConvertToString(message, `${preString}`));
        this.logToFile(message, "");
        if (log._depth < 1)
            return;
        log.write(text, process_1.stdout);
    }
    Trace(message = "") {
        let preString = log.rotBgColor(this._prefixes) + chalk_1.default.bgBlack(chalk_1.default.white(log.op + "TRACE" + log.ed + log._joint));
        let text = (ConvertToString(message, `${preString}`));
        this.logToFile(message, "");
        if (log._depth < 2)
            return;
        log.write(text, process_1.stdout);
    }
    Debug(message = "") {
        let preString = log.rotBgColor(this._prefixes) + chalk_1.default.bgBlack(chalk_1.default.white(log.op + "DEBUG" + log.ed + log._joint));
        let text = (ConvertToString(message, `${preString}`));
        this.logToFile(message, "");
        if (log._depth < 1)
            return;
        log.write(text, process_1.stdout);
    }
    static write(message, method) {
        method.write(message);
    }
    logToFile(message, filePath) {
        message = ConvertToString(message);
        let logString = message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        //TODO: wirte logging to file
    }
    /**
     * Puts a colored prefix before every line in the log
     *
     * This allow the log to be more easily readable and related to a given line of execution
     * @param prefix
     * @param chalk_method
     */
    static Prefix(prefix, chalk_method = chalk_1.default.bgMagenta) {
        return log.initial.Prefix(prefix, chalk_method);
    }
    static Error(message = "") {
        log.initial.Error(message);
    }
    static Trace(message = "") {
        log.initial.Trace(message);
    }
    static Debug(message = "") {
        log.initial.Debug(message);
    }
    static Log(message = "") {
        log.initial.Log(message);
    }
    static Print(message = "") {
        log.initial.Print(message);
    }
    static SetLogLevel(level) {
        this._logLevel = level;
    }
}
exports.default = log;
log.op = Boolean(process_1.stdout.isTTY) ? ' ' : '';
log.ed = Boolean(process_1.stdout.isTTY) ? ' ' : '';
log._joint = Boolean(process_1.stdout.isTTY) ? '' : ' > ';
// private static _logLevel = parseInt(env["LOGLEVEL"] ?? (loggingConfig?.Level.toString() ?? '1'))
// private static _debug = 0 + (env["DEBUG"] !== undefined && !isNaN(parseInt(env["DEBUG"])) ? parseInt(env["DEBUG"]) : parseInt(loggingConfig.Level?.debug?.toString() ?? "0"))
log._logLevel = process_1.env["LOGLEVEL"] ? parseInt(process_1.env["LOGLEVEL"]) : loggingConfig.Level;
log._depth = 0 + (process_1.env["DEBUG"] != null ? (process_1.env["DEBUG"] !== undefined && !isNaN(parseInt(process_1.env["DEBUG"])) ? parseInt(process_1.env["DEBUG"]) : 0) : loggingConfig.Depth);
log.initial = new log();
function Formatting(message) {
    let match = /<[a-zA-Z]*>/g;
    let infoStart = match.exec(message);
    if (infoStart === null)
        return message;
    let endMatch = new RegExp(infoStart[0].replace(/^</, '</'), 'g');
    let infoEnd = endMatch.exec(message.slice(infoStart.index + infoStart[0].length));
    if (infoEnd === null)
        return message.slice(0, infoStart.index + infoStart[0].length) + (Formatting(message.slice(infoStart.index + infoStart[0].length)));
    infoEnd.index += infoStart[0].length + infoStart.index;
    let method = infoStart[0].replace(/^</, '').replace(/>$/, '');
    let replacement = message.slice(infoStart.index + infoStart[0].length, infoEnd.index);
    replacement = Formatting(replacement);
    replacement = log.Colors(method)(replacement);
    return Formatting(message.slice(0, infoStart.index) + replacement + message.slice(infoEnd.index + infoEnd[0].length));
}
exports.Formatting = Formatting;
function ConvertToString(obj, newLineStart = "") {
    let message;
    if (!(obj instanceof String || typeof obj == 'string')) {
        message = (0, util_1.inspect)(obj).toString();
    }
    else {
        message = obj;
    }
    let lines = message.split("\n");
    let result = "";
    if (newLineStart)
        newLineStart += " ";
    for (let i = 0; i < lines.length; i++) {
        result += `${newLineStart}${Formatting(lines[i])}\n`;
    }
    return result;
}
exports.ConvertToString = ConvertToString;
//# sourceMappingURL=logging.js.map