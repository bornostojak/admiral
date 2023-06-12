import { Client } from 'ssh2';
import {fstat, readFileSync, unlinkSync} from 'fs';
import net from "net";
import { exit } from 'process';
import log from '../logging.js'

//let DOCKER_SOCKET = '/var/run/docker.sock'
//let LOCAL_SOCKET = '/tmp/docker.temp.sock'
//let server:any = null
//var localStream:net.Socket|null = null


export default function bindSocket(remoteSocketPath: string, localSocketPath: string, sshParameters:object) {

    let localStream: net.Socket|undefined = undefined
    let server = net.createServer((stream) => {
        log(`Binding remote socket ${remoteSocketPath} to local socket ${localSocketPath} over ssh.`)
        localStream = stream
    })
    .listen(localSocketPath)
    .on('connection', () => {
        var conn2 = new Client()
        conn2.on('ready', () => {
            conn2.openssh_forwardOutStreamLocal(remoteSocketPath, (err, stream) => {
                if (err) {
                    log(err)
                    return
                }
                log(`A connection to the local socket ${localSocketPath} has been established.`)
                if (localStream != null)
                    stream.pipe(localStream).pipe(stream)
            })
        })
        .connect(sshParameters)

    })
    server;
}

