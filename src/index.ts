import { Client } from 'ssh2';
import {fstat, readFileSync, unlinkSync} from 'fs';
import net from "net";
import { exit } from 'process';
import log from './logging.js'

let DOCKER_SOCKET = '/var/run/docker.sock'
let LOCAL_SOCKET = '/tmp/docker.temp.sock'
let server:any = null
let local_stream:net.Socket|null = null


server = net.createServer((localStream) => {
    log("Createing server..")
    //stream.pipe(local_stream).pipe(stream);
    local_stream = localStream
    log("Server Created")
})
.listen(LOCAL_SOCKET)
.on('connection', () => {
    var conn2 = new Client()
    conn2.on('ready', () => {
        conn2.openssh_forwardOutStreamLocal(DOCKER_SOCKET, (err, stream) => {
            if (err) {
                log(err)
                return
            }
            if (local_stream)
                stream.pipe(local_stream).pipe(stream)
        })
    })
    .connect({
        host: '192.168.20.81',
        port: 22,
        username: 'root',
        password: 'bint123',
    })

})


try {
    process.on('SIGINT', (code) => {exit(1)})
    process.on('exit', (code) => {unlinkSync(LOCAL_SOCKET); log('done')})
} catch {
    log("Shit")
}