import Docker from 'dockerode';

let node = new Docker({socketPath: "/tmp/docker.temp.sock"})

for (let i = 0; i < 1; i++) {
    performTest()
}

async function performTest() {
    await node.listServices((e,c) => {
        console.log({e, c})
        if (e) throw Error(e)

    })
}