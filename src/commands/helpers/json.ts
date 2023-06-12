import logging, {Formatting as ColorFormatting} from '../../logging'
import Colorizer from 'json-colorizer'

export function Colorized(obj: object) {
    return Colorizer(JSON.stringify(obj, null, 2))
}

function stringifyObjectValues(object: { [key: string]: any }): { [key: string]: string } {
    return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, ((value instanceof Array) ? value.map(v => typeof v === 'string' ? v : JSON.stringify(v, null, 0)).join(', ') : (typeof value === 'string' ? value : JSON.stringify(value, null, 0)))]))
}

export function toTableString(obj: Object[]): string;
export function toTableString({ ...obj }: { [key: string]: Object }): string;
export function toTableString(obj: unknown, title?: false): string {
    if (!(obj instanceof Array)) {
        let final = ''
        for (let [key, content] of Object.entries(obj as { [key: string]: any[] })) {
            let tableString = toTableString(content)
            let rowLength = tableString.split('\n')[0].length
            final += `+${"-".repeat(rowLength-2)}+\n`
            final += `| <cyan><b>${key}</b></cyan>${" ".repeat(rowLength - key.length - 3)}|\n`
            // final += `+${(new Array(rowLength-2)).join("-")}+\n`
            final += tableString
        }
        return ColorFormatting(final)
    }

    // convert each objects values into a string
    let srcObjectWithStringifiedValuesArray: { [key: string]: string }[] = (obj as { [key: string]: any }[]).map(o => stringifyObjectValues(o))

    // from an object array with similar keys [{..}, {..}, {..}]
    // reduce them to to an object {[key:string]: value: number}
    // where the value is the largest length of all that specific
    // key's values in the object array
    let maxLengthArray: { [key: string]: any }[] = srcObjectWithStringifiedValuesArray
        ?.map(o => Object.fromEntries(
            Object.entries(o)
                .map(([x, y]) => [x, y.length > String(x).length ? y.length : String(x).length])
        ))
    let cellWidthByHeader = maxLengthArray.reduce((res, o) => {
        for (let key of [...Object.keys(res), ...Object.keys(o)]) {
            if (!res[key] || res[key] < o[key]) res[key] = o[key]
        }
        return res
    })
    // define the border, which goes between the rows
    let border = '+' + Object.values(cellWidthByHeader).map(l => "-".repeat(l + 2)).join("+") + "+\n"

    // headers
    let headers = Object.entries(cellWidthByHeader).map(([header, width]) => `| ${header}${' '.repeat(width - header.length + 1)}`).join('') + '|\n'
    // defining the header row 
    let tableString = border + headers + border.replace(/-/g, "=")
    // iterating over the elements to define each row
    for (let rowObject of srcObjectWithStringifiedValuesArray) {
        for (let [header, cellWidth] of Object.entries(cellWidthByHeader)) {
            // if the current "header" is not in this object, fill cell with empty space, then continue
            if (!Object.keys(rowObject).includes(header)) {
                tableString += '| ' + ' '.repeat(cellWidth + 1)
                continue
            }
            let cellValue = rowObject[header]
            tableString += `| ${cellValue}${' '.repeat(cellWidth - cellValue.length )} `
        }
        // finish the row string an continue to the next row
        tableString += "|\n"
        tableString += border
    }
    return tableString

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