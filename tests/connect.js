import connectToDockerOverSSH, { listContainerNames, listNodeNames } from '../dist/docker.js';
import logging from '../dist/logging.js';
import { exit } from 'process';
import fs from 'fs';
let remoteSocketPath = "/var/run/docker.sock";
let localSocketPath = "/tmp/docker.temp.sock";
let sshConnectionParameters = {
    host: '192.168.1.200',
    port: 22,
    username: 'hermes',
    privateKey : fs.readFileSync("/home/borno/.ssh/id_rsa")
    //password: 'bint123'
};
process.on("SIGINT", () => exit(1));
//bindSocketAsync(remoteSocketPath, localSocketPath, sshConnectionParameters)
let node = await connectToDockerOverSSH(sshConnectionParameters);
//let node = new Docker({socketPath: "/tmp/docker.temp.sock"})
let log = new logging("Connection test");
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
let services = await node.listServices();
let nodes = await node.listNodes();
let nodeNames = await listNodeNames(node);
let containerNames = await listContainerNames(node);
let containers = await node.listContainers();
log.log("Services >>  " + services?.join("\n>>  "));
log.log("Container >>  " + containerNames?.join("\n>>  "));
log.log("Nodes >>  " + nodeNames?.join("\n  "));
log.prefix('Container names').debug("  " + containerNames?.join("\n  "));
log.prefix("Container keys").debug(containers?.map(c => Object.keys(c)));
log.prefix("Node keys").debug(JSON.stringify(nodes[0], null, 4));
exit(0);
//# sourceMappingURL=connect.js.map