import logging from "./logging.js"
import Docker from 'dockerode'
import bindRemoteSocketAsync from './connections/sockets.js'
import crypto from "crypto"
import YAML from 'yamljs'
import * as fs from 'fs';
import * as path from 'path';
import { IServerOld } from "./config/servers.js"
import Config from "./config/manager.js"

let log = new logging("Docker management")

export interface NodeType {
    ID: string,
    Version: { Index: string },
    CreatedAt: string,
    UpdatedAt: string,
    Spec: {
      Labels: Record<string, string>,
      Role: string,
      Availability: string
    },
    Description: {
      Hostname: string,
      Platform: { Architecture: string, OS: string },
      Resources: { NanoCPUs: number, MemoryBytes: number },
      Engine: { EngineVersion: string, Plugins: Array<any> },
      TLSInfo: {
        TrustRoot: string,
        CertIssuerSubject: string,
        CertIssuerPublicKey: string
      }
    },
    Status: { State: string, Addr: string },
    ManagerStatus: { Reachability: string, Addr: string}
}


export async function ConnectToDockerOverSSH(sshConnectionParameters: object){
    return new Promise<Docker>(async (resolve, reject) => {
        try {
            log.Debug("Creating a bound socket...")
            let localSocketPath = "/tmp/docker_"+crypto.randomUUID().slice(0,8)+".sock"
            let remoteSocketPath =  "/var/run/docker.sock"
            log.Debug({localSocketPath, remoteSocketPath})
            await bindRemoteSocketAsync(remoteSocketPath, localSocketPath, sshConnectionParameters)
            log.Debug(`Remote socket bound to local socket <blue>${localSocketPath}</blue>`)
            let node = new Docker({socketPath: localSocketPath})
            log.Debug("A node has successfully attached")
            resolve(node)
        } catch(err) {
            log.Error(err)
            reject(err)
        }
    } )
}

export function ConvertServerToSSHConnInfo(server: IServerOld) {
   let localConfig = Config.GetLocalConfigSync()
   if (localConfig?.ssh?.privateKey) {
    let info = {debug: true, host: server["host"], port: server["port"], username: server["username"], privateKey: Buffer.from(localConfig?.ssh?.privateKey, 'utf-8')}
    log.Print(info)
    return info
   }
   let info = {host: server["host"], port: server["port"], username: server["username"], password: server["password"]}
   log.Print(info)
   return info
}

export async function Deploy(docker: Docker, stack: string, project: string) {

  

// Read the YAML file and convert it to a JavaScript object
const yamlFile = fs.readFileSync('/path/to/service.yaml', 'utf8');
const serviceConfig = YAML.parse(yamlFile);

// Deploy the Docker service using the configuration from the YAML file
const service = await docker.createService(serviceConfig);
await service.inspect();
}

//export function getNodes(node: Docker) {
//    return new Promise((resolve, reject) => {
//        node.listNodes((err, nodes) => {
//            if (err)
//                reject(err)
//            resolve(nodes)
//        })
//    }).catch(null)
//}
//
//export function getServices(node: Docker) {
//    return new Promise<Docker.Service[] | undefined>((resolve, reject) => {
//        node.listServices((err, services) => {
//            if (err)
//                reject(err)
//            resolve(services)
//        })
//    }).catch(null)
//}
//
//export function getContainers(node: Docker) {
//    return new Promise<Docker.ContainerInfo[] | undefined>((resolve, reject) => {
//        node.listContainers((err, containers) => {
//            if (err)
//                reject(err)
//            resolve(containers)
//        })
//    }).catch(null)
//}
//
export async function listNodeNames(node: Docker) {
    return (<Array<any>> await node.listNodes())?.map(s => s["Description"]["Hostname"])?.flat().map(c => c?.replace(/^\//, ""))
}
export async function listServiceNames(node: Docker) {
    return (await node.listServices())?.map(s => s.Spec)?.map(s => s?.Name)
}
export async function listContainerNames(node: Docker) {
    return (await node.listContainers())?.map(s => s?.Names)?.flat().map(c => c.replace(/^\//, ""))
}
