import { Client } from 'ssh2';
import net from "net";
import logging from '../logging.js'
import { existsSync, unlinkSync } from 'fs';

let log = new logging("Socket Binding")

/**
 * Bind the remote server's docker docket to a local socket via SSH
 * @param remoteSocketPath The linux path of the remote unix socket for docker,
 * default is `/var/run/docker.sock`
 * @param localSocketPath The local unix socket's path
 * @param sshParameters Define the ssh parameters as a JSON object 
 * in the style of the `ssh2` `npm` package
 * @returns {net.Server} returns the server component for the local unqx socket
 */
export default async function bindRemoteSocketAsync(remoteSocketPath: string, localSocketPath: string, sshParameters:object) {    
    return new Promise<net.Server>((resolve, reject) => {
        log.Debug("<blue>REMOTE SOCKET PARAMETERS</blue> <b>"+JSON.stringify({...sshParameters, ...{readyTimeout: 15000}})+"</b>")
        let server = net.createServer(() => {
            log.Debug(`Binding remote socket <blue>${remoteSocketPath}</blue> to local socket <blue>${localSocketPath}</blue> over ssh.`)
        })
        .listen(localSocketPath)
        .on('connection', (localSocketStream) => {
            log.Debug("Connecting over ssh...")
            var conn2 = new Client()
            conn2.on('ready', () => {
                conn2.openssh_forwardOutStreamLocal(remoteSocketPath, (err, remoteSocketStream) => {
                    if (err) {
                        log.Error(err)
                        reject(err)
                        return
                    }
                    log.Debug(`A connection to the local socket ${localSocketPath} has been established.`)
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

