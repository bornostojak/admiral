import Docker from 'dockerode';
import connectToDockerOverSSH, { getContainers, getNodes, listContainerNames as listContainerNames, listNodeNames, listServiceNames } from './docker.js';
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
//bindSocketAsync(remoteSocketPath, localSocketPath, sshConnectionParameters)
let node = await connectToDockerOverSSH(sshConnectionParameters)

//let node = new Docker({socketPath: "/tmp/docker.temp.sock"})
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


//let services = await listServiceNames(node)
let services = await node.listServices()
let nodeNames = await listNodeNames(node)
let nodes = await getNodes(node)
nodes = await node.listNodes()
let containerNames = await listContainerNames(node)
let containers = await getContainers(node)
containers = await node.listContainers()
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
log.prefix('Node names').log("  "+nodeNames?.join("\n  "))
log.prefix("Node keys").error((<Array<object>>nodes)?.map(n => Object.keys(n?.Description)))






exit(0)