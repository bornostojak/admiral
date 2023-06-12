import Docker from 'dockerode'
import logging from "./logging.js"
import bindSocketAsync from './connections/bindSocket.js'
import crypto from "crypto"

let log = new logging("Docker management")

export default async function connectToDockerOverSSH(sshConnectionParameters: object){
    return new Promise<Docker>(async (resolve, reject) => {
        try {
            log.debug("Creating a bound socker...")
            let localSocketPath = "/tmp/docker_"+crypto.randomUUID().slice(0,8)+".sock"
            let remoteSocketPath =  "/var/run/docker.sock"
            log.debug({localSocketPath, remoteSocketPath})
            await bindSocketAsync(remoteSocketPath, localSocketPath, sshConnectionParameters)
            log.log(`Remote socket bound to local socket <blue>${localSocketPath}</blue>`)
            let node = new Docker({socketPath: localSocketPath})
            log.debug("A node has successfully attached")
            resolve(node)
        } catch(err) {
            log.error(err)
            reject(err)
        }

        
    } )
    
}
export function getNodes(node: Docker) {
    return new Promise((resolve, reject) => {
        node.listNodes((err, nodes) => {
            if (err)
                reject(err)
            resolve(nodes)
        })
    }).catch(null)
}

export function getServices(node: Docker) {
    return new Promise<Docker.Service[] | undefined>((resolve, reject) => {
        node.listServices((err, services) => {
            if (err)
                reject(err)
            resolve(services)
        })
    }).catch(null)
}

export function getContainers(node: Docker) {
    return new Promise<Docker.ContainerInfo[] | undefined>((resolve, reject) => {
        node.listContainers((err, containers) => {
            if (err)
                reject(err)
            resolve(containers)
        })
    }).catch(null)
}

export async function listNodeNames(node: Docker) {
    return (<Array<object>> await getNodes(node))?.map(s => s["Description"]["Hostname"])?.flat().map(c => c?.replace(/^\//, ""))
}
export async function listServiceNames(node: Docker) {
    return (await getServices(node))?.map(s => s.Spec)?.map(s => s?.Name)
}
export async function listContainerNames(node: Docker) {
    return (await getContainers(node))?.map(s => s?.Names)?.flat().map(c => c.replace(/^\//, ""))
}
//export function listNodeContainers(node: Docker) {
//    return new Promise((resolve, reject) => {
//        node.listContainers((err, containers) => {
//            resolve((containers ?? new Array<Docker.ContainerInfo>())?.map(s => s.Names.map(c => c.replace(/^\//, ''))?.join('\n'))?.sort().join("\n"))
//        })
//    }).catch(null)
//}