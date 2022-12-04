import Docker from 'dockerode';

let node = new Docker({socketPath: "/tmp/docker.temp.sock"})

node.listServices((e,c) => console.log({e,c}))