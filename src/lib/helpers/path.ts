import { Resolver } from 'dns'
import os from 'os'
import path from 'path'

export function ResolveUri(uri: string) {
    return path.resolve(
        uri.replace(/^~\//, os.homedir()+'/')
            .replace(/^~([a-z])/, "/home/$1")
            .replace(/^~$/, os.homedir())
        )
}