import { Client } from 'ssh2';
import net from "net";
import logging from '../logging.js'
import { existsSync, unlinkSync } from 'fs';

let log = new logging("SOCKET BINDING")
/**
 * bind a remote server's docker to a remote socket via SSH
 * */
export default function bindSocketAsync(remoteSocketPath: string, localSocketPath: string, sshParameters:object) {    
    log.log("REMOTE SOCKET PARAMETERS"+JSON.stringify({...sshParameters, ...{readyTimeout: 15000}}))
    return new Promise<net.Server>((resolve, reject) => {
        let server = net.createServer(() => {
            log.log(`Binding remote socket ${remoteSocketPath} to local socket ${localSocketPath} over ssh.`)
        })
        .listen(localSocketPath)
        .on('connection', (localSocketStream) => {
            var conn2 = new Client()
            conn2.on('ready', () => {
                conn2.openssh_forwardOutStreamLocal(remoteSocketPath, (err, remoteSocketStream) => {
                    if (err) {
                        log.log(err)
                        reject(err)
                        return
                    }
                    log.log(`A connection to the local socket ${localSocketPath} has been established.`)
                    if (localSocketStream != null)
                        remoteSocketStream.pipe(localSocketStream).pipe(remoteSocketStream)
                })
            })
            .connect({...{readyTimeout: 15000, ...sshParameters}})
        })
        process.on("SIGINT", () => { if (existsSync(localSocketPath)) unlinkSync(localSocketPath) })
        process.on("exit", () => { if (existsSync(localSocketPath)) unlinkSync(localSocketPath) })
        resolve(server);
    })
}

