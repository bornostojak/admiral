"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorizedJSON = exports.toIndentedStringify = exports.toTableString = void 0;
const logging_1 = require("../../logging");
const json_colorizer_1 = __importDefault(require("json-colorizer"));
function toTableString(obj, title) {
    if (!(obj instanceof Array)) {
        let final = '';
        for (let [key, content] of Object.entries(obj)) {
            let tableString = toTableString(content);
            let rowLength = tableString.split('\n')[0].length;
            if (rowLength < 2) {
                final += "";
                continue;
            }
            final += `+${"-".repeat(rowLength - 2)}+\n`;
            final += `| <cyan><b>${key}</b></cyan>${" ".repeat(rowLength - key.length - 3)}|\n`;
            // final += `+${(new Array(rowLength-2)).join("-")}+\n`
            final += tableString;
        }
        return (0, logging_1.Formatting)(final);
    }
    if (obj.length == 0) {
        return '';
    }
    // convert each objects values into a string
    let srcObjectWithStringifiedValuesArray = obj.map(o => stringifyObjectValues(o));
    // from an object array with similar keys [{..}, {..}, {..}]
    // reduce them to to an object {[key:string]: value: number}
    // where the value is the largest length of all that specific
    // key's values in the object array
    let maxLengthArray = srcObjectWithStringifiedValuesArray === null || srcObjectWithStringifiedValuesArray === void 0 ? void 0 : srcObjectWithStringifiedValuesArray.map(o => Object.fromEntries(Object.entries(o)
        .filter(([x, y]) => x && y)
        .map(([x, y]) => [x, y.length > String(x).length ? y.length : String(x).length])));
    let cellWidthByHeader = maxLengthArray.reduce((res, o) => {
        for (let key of [...Object.keys(res), ...Object.keys(o)]) {
            if (!res[key] || res[key] < o[key])
                res[key] = o[key];
        }
        return res;
    });
    // define the border, which goes between the rows
    let border = '+' + Object.values(cellWidthByHeader).map(l => "-".repeat(l + 2)).join("+") + "+\n";
    // headers
    let headers = Object.entries(cellWidthByHeader).map(([header, width]) => `| ${header}${' '.repeat(width - header.length + 1)}`).join('') + '|\n';
    // defining the header row 
    let tableString = border + headers + border.replace(/-/g, "=");
    // iterating over the elements to define each row
    for (let rowObject of srcObjectWithStringifiedValuesArray) {
        for (let [header, cellWidth] of Object.entries(cellWidthByHeader)) {
            // if the current "header" is not in this object, fill cell with empty space, then continue
            if (!Object.keys(rowObject).includes(header)) {
                tableString += '| ' + ' '.repeat(cellWidth + 1);
                continue;
            }
            let cellValue = rowObject[header];
            tableString += `| ${cellValue}${' '.repeat(cellWidth - cellValue.length)} `;
        }
        // finish the row string an continue to the next row
        tableString += "|\n";
        tableString += border;
    }
    return tableString;
}
exports.toTableString = toTableString;
/**
 *
 * @param obj the object that will be converted to an indented string
 * @param heading the object containing the title and title value information
 * @returns the string converted into an tab indented format
 */
function toIndentedStringify(obj, heading) {
    let finalString = "";
    if (heading && "title" in heading) {
        let Header = `<b>${heading.title}</b>`;
        if (heading["value"]) {
            Header += `: <b><cyan>${heading.value}</cyan></b>`;
        }
        finalString += (0, logging_1.Formatting)(Header) + '\n';
    }
    // let objArray: Object[] = (obj instanceof Array) ? obj : [obj]
    for (let entry of obj) {
        finalString += leftPadding(convertObjectToString(entry)) + '\n';
    }
    return finalString;
}
exports.toIndentedStringify = toIndentedStringify;
function leftPadding(string) {
    return '  ' + string.replace(/\n/g, '\n  ').replace(/\n  $/, '\n');
}
function convertObjectToString(obj) {
    let parsedString = "";
    let longestKeyLength = 4 + Math.max(...(Object.keys(obj).map(x => x.length)));
    for (let [header, content] of Object.entries(obj)) {
        let spacing = " ".repeat(longestKeyLength - header.length) + ': ';
        parsedString += (0, logging_1.Formatting)(`<b><cyan>${header}</cyan></b>`);
        if (content instanceof Array) {
            parsedString += spacing + content.map(x => (typeof x === "string") ? x : JSON.stringify(x)).join(', ') + '\n';
            continue;
        }
        if (content instanceof Object) {
            // parsedString += ':\n' + leftPadding(convertObjectToString(content)) + '\n'
            parsedString += spacing + JSON.stringify(content) + '\n';
            continue;
        }
        parsedString += spacing + String(content) + '\n';
    }
    return parsedString;
}
function ColorizedJSON(obj) {
    return (0, json_colorizer_1.default)(JSON.stringify(obj, null, 2));
}
exports.ColorizedJSON = ColorizedJSON;
function stringifyObjectValues(object) {
    return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, ((value instanceof Array) ? value.map(v => typeof v === 'string' ? v : JSON.stringify(v, null, 0)).join(', ') : (typeof value === 'string' ? value : JSON.stringify(value, null, 0)))]));
}
//# sourceMappingURL=json.js.map