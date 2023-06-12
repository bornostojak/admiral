import Docker from 'dockerode';
import { getContainers, listContainerNames as listContainerNames, listServiceNames } from './docker.js';
import { Callback } from 'ssh2';

let node = new Docker({socketPath: "/tmp/docker.temp.sock"})
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
let containers = await getContainers(node)
console.log("Services")
console.log()
console.log("\n>>  "+services?.join("\n>>  "))
console.log()
console.log()
console.log()
console.log()
console.log("Containers")
console.log()
//console.log("\n>>  "+containers?.join("\n>>  "))
console.log(containers?.map(c => Object.keys(c)))