import bindSocket from './connections/bindSocket.js' 
import {unlinkSync} from "fs"
import {exit} from 'process'
import log from './logging.js'

let remoteSocketPath = "/var/run/docker.sock"
let localSocketPath =  "/tmp/docker.temp.sock"
let sshConnectionParameters = {
    host: '192.168.20.81',
    port: 22,
    username: 'root',
    password: 'bint123'
}
bindSocket(remoteSocketPath, localSocketPath, sshConnectionParameters)



try {
    process.on('SIGINT', (code) => {exit(1)})
    process.on('exit', (code) => {unlinkSync(localSocketPath); log('done')})
} catch {
    log("Shit")
}