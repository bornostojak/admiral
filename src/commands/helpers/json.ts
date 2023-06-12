import logging, {Formatting as ColorFormatting} from '../../logging'
import Colorizer from 'json-colorizer'

export function Colorized(obj: object) {
    return Colorizer(JSON.stringify(obj, null, 2))
}
export function IndentedStringify(obj: object, heading?: {title?: string, value?: string}, level: number = 0) {
    let objectArray: Array<object>  = ( obj instanceof Array) ?  obj : [obj]
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