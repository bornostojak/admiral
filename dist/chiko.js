const { create } = require('domain');
var net = require('net'), fs = require('fs'), connections = {}, server, client, mode;
const SOCKETFILE = '/tmp/unix.sock';
export function createServer(socket) {
    console.log('Creating server.');
    var server = net.createServer(function (stream) {
        console.log('Connection acknowledged.');
        // Store all connections so we can terminate them if the server closes.
        // An object is better than an array for these.
        var self = Date.now();
        connections[self] = (stream);
        stream.on('end', function () {
            console.log('Client disconnected.');
            delete connections[self];
        });
        // Messages are buffers. use toString
        stream.on('data', function (msg) {
            msg = msg.toString();
            if (msg === '__snootbooped') {
                console.log("Client's snoot confirmed booped.");
                return;
            }
            console.log('Client:', msg);
            if (msg === 'foo') {
                stream.write('bar');
            }
            if (msg === 'baz') {
                stream.write('qux');
            }
            if (msg === 'here come dat boi') {
                stream.write('Kill yourself.');
            }
        });
    })
        .listen(socket)
        .on('connection', function (socket) {
        console.log('Client connected.');
        console.log('Sending boop.');
        socket.write('__boop');
        //console.log(Object.keys(socket));
    });
    return server;
}
//# sourceMappingURL=chiko.js.map