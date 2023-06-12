import Docker from 'dockerode'

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