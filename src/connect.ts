import Docker from 'dockerode';
import { getContainers, listContainerNames as listContainerNames, listServiceNames } from './docker.js';
import { Callback } from 'ssh2';
import logfunc from './logging.js';
import chalk, { ChalkInstance } from 'chalk';
import bindSocketAsync from './connections/bindSocket.js';
import { exit } from 'process';


let remoteSocketPath = "/var/run/docker.sock"
let localSocketPath =  "/tmp/docker.temp.sock"
let sshConnectionParameters = {
    host: '192.168.20.81',
    port: 22,
    username: 'root',
    password: 'bint123'
}
process.on("SIGINT", () => exit(1))
bindSocketAsync(remoteSocketPath, localSocketPath, sshConnectionParameters)
let node = new Docker({socketPath: "/tmp/docker.temp.sock"})
let log = new logfunc("madafaka")
//
//for (let i = 0; i < 1; i++) {
//    performTest()
//}
//
//async function performTest() {
//    await node.listServices((e,c) => {
//        
//        console.log((c ?? new Array())?.map(s => s.Spec).map(s => s.Name).sort().join("\n"))
//        
//
//    })
//}
//
//
//
//async function pro(callback: Callback){
//    await node.listServices((e,c) => {
//        let ola = (c ?? new Array())?.map(s => s.Spec).map(s => s.Name).sort().join("\n")
//        return ola
//    })
//}


let services = await listServiceNames(node)
let containerNames = await listContainerNames(node)
let containers = await getContainers(node)
log.log("Services")
log.log()
log.log("\n>>  "+services?.join("\n>>  "))
log.log()
log.log()
log = log.prefix("fuck")
log.log()
log.log()
log.log("Containers")
log.log()
log.log("\n>>  "+containerNames?.join("\n>>  "))
log.prefix('Container names').log("  "+containerNames?.join("\n  "))
log.prefix("Container keys").debug(containers?.map(c => Object.keys(c)))




exit(0)