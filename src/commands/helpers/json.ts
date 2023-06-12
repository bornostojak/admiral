import logging, {Formatting as ColorFormatting} from '../../logging'
import Colorizer from 'json-colorizer'

export function Colorized(obj: object) {
    return Colorizer(JSON.stringify(obj, null, 2))
}
export function TableString(obj: Object) : String;
export function TableString(obj: Object, firstLevelHeading: boolean ) : String ;
export function TableString(obj: Object, firstLevelHeading: boolean = false ) : String {
    let objArray : Object[]  = (obj instanceof Array) ? obj : [obj]
    let finalString = ""
    let cellWidths : {[key: string]: number} = {}
    for (let item of objArray) {
        for (let [title, content] of Object.entries(item)) {
            // calculate the sizes of the table's cells
            for (let element of content) {
                for (let [key, val] of Object.entries(element)) {
                    let parsedValue = val instanceof Array ? val.map(v => v instanceof String ? v : JSON.stringify(v)).join(', ') : (typeof val === "string" ? val : JSON.stringify(val))
                    let maxLengthOfNameAndValue = parsedValue.length > key.length ? parsedValue.length : key.length
                    if ((cellWidths[(key as string)] ?? 0) < maxLengthOfNameAndValue)
                        cellWidths[(key as string)] =  maxLengthOfNameAndValue
                }
            }
        }
    }
    finalString+=''
    for (let item of objArray) {
        for (let [title, content] of Object.entries(item)) {
            // calculate the top table border
            finalString += Object.values(cellWidths).map(x => '-'+(new Array(3+x)).join('-')).join('').replace(/^-/, "+")+"+\n"
            // calculate the title with borders
            finalString += "| " + `<b><cyan>${title}</cyan></b>` + (new Array(Object.keys(cellWidths).length*3 -title.length -1 + Object.values(cellWidths).reduce((a,b) => a+b))).join(' ') + '|\n'
            // calculate the headers
            finalString += Object.values(cellWidths).map(x => '+'+(new Array(3+x)).join('-')).join('')+"+\n"
            finalString += Object.entries(cellWidths).map(x => '| '+x[0][0].toUpperCase()+x[0].slice(1)+(new Array(2+x[1]-x[0].length)).join(' ')).join('') + '|\n'
            finalString += Object.values(cellWidths).map(x => '+'+(new Array(3+x)).join('-')).join('')+"+\n"
            // iterate over all entries
            for (var entry of content) {
                for (let header of Object.keys(cellWidths)) {
                    let parsedValue = entry[header] instanceof Array ? (entry[header] as Array<any>).map(v => typeof v === "string" ? v : JSON.stringify(v)).join(', ') : (typeof entry[header] === "string" ? entry[header] : JSON.stringify(entry[header]))
                    finalString += '| ' + (parsedValue ?? '') +(new Array(2 + cellWidths[header] - (parsedValue?.length ?? 0))).join(' ')
                }
                finalString += "|\n"
            }
            finalString += Object.values(cellWidths).map(x => '+'+(new Array(3+x)).join('-')).join('')+"+\n\n"
        }
    }
    return ColorFormatting(finalString)
}
export function IndentedStringify(obj: object, heading?: {title: string, value?: string}, level: number = 0) {
    let finalString = ""
    if (heading && "title" in heading) {
        let Header = `<b>${heading.title}</b>`
        if (heading["value"]) {
            Header += `: <b><cyan>${heading.value}</cyan></b>`
        }
        finalString += ColorFormatting(Header) + '\n'
    }
    let objArray : Object[]  = (obj instanceof Array) ? obj : [obj]
    for (let entry of objArray) {
        finalString += leftPadding(convertObjectToString(entry))
    }
    return finalString
}

function leftPadding(string:string) : string {
    return '  '+string.replace(/\n/g, '\n  ').replace(/\n  $/, '\n')
}

function convertObjectToString(obj: Object) : string {
    let parsedString : string = ""
    let longestKeyLength = 5 + Math.max(...(Object.keys(obj).map(x => x.length)))
    for (let [key, entry] of Object.entries(obj)) {
        let dots = Array(longestKeyLength - key.length).join('.') + ': '
        parsedString += ColorFormatting(`<b><cyan>${key}</cyan></b>`)
        if (entry instanceof Array) {
            parsedString += dots + entry.map(x => (typeof x === "string") ? x : JSON.stringify(x)).join(', ') + '\n'
            continue
        }
        if (entry instanceof Object) {
            parsedString += ':\n' + leftPadding(convertObjectToString(entry)) + '\n'
            continue
        }
        parsedString += dots + String(entry) + '\n'
    }
    return parsedString
}