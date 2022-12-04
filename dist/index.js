import { Client } from 'ssh2';
import { unlinkSync } from 'fs';
import net from "net";
import { exit } from 'process';
let DOCKER_SOCKET = '/var/run/docker.sock';
let LOCAL_SOCKET = '/tmp/docker.temp.sock';
let server = null;
let local_stream = null;
try {
    var conn = new Client();
    conn.on('ready', function () {
        console.log("Connection ready");
        conn.openssh_forwardOutStreamLocal(DOCKER_SOCKET, (err, stream) => {
            //console.log(err);
            if (err) {
                console.log(err);
                exit(1);
            }
            if (server != null)
                return;
            server = net.createServer((str) => {
                local_stream = str;
                console.log("Createing server..");
                //stream.pipe(local_stream).pipe(stream);
                console.log("Server Created");
            })
                .listen(LOCAL_SOCKET)
                .on('connection', (kork) => {
                console.log("Connecting to socket...");
                if (local_stream != null)
                    stream.pipe(local_stream).pipe(stream);
            });
        });
    })
        .connect({
        host: '192.168.20.81',
        port: 22,
        username: 'root',
        password: 'bint123',
    });
}
catch (err) {
}
try {
    process.on('SIGINT', (code) => { unlinkSync(DOCKER_SOCKET); console.log('done'); });
    process.on('exit', (code) => { unlinkSync(DOCKER_SOCKET); console.log('done'); });
}
catch {
    console.log("Shit");
}
//# sourceMappingURL=index.js.map