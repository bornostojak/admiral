"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const net_1 = __importDefault(require("net"));
const logging_js_1 = __importDefault(require("../logging.js"));
const fs_1 = require("fs");
let log = new logging_js_1.default("Socket Binding");
/**
 * Bind the remote server's docker docket to a local socket via SSH
 * @param remoteSocketPath The linux path of the remote unix socket for docker,
 * default is `/var/run/docker.sock`
 * @param localSocketPath The local unix socket's path
 * @param sshParameters Define the ssh parameters as a JSON object
 * in the style of the `ssh2` `npm` package
 * @returns {net.Server} returns the server component for the local unqx socket
 */
function bindRemoteSocketAsync(remoteSocketPath, localSocketPath, sshParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            log.Debug("<blue>REMOTE SOCKET PARAMETERS</blue> <b>" + JSON.stringify(Object.assign(Object.assign({}, sshParameters), { readyTimeout: 15000 })) + "</b>");
            let server = net_1.default.createServer(() => {
                log.Debug(`Binding remote socket <blue>${remoteSocketPath}</blue> to local socket <blue>${localSocketPath}</blue> over ssh.`);
            })
                .listen(localSocketPath)
                .on('connection', (localSocketStream) => {
                log.Debug("Connecting over ssh...");
                var conn2 = new ssh2_1.Client();
                conn2.on('ready', () => {
                    conn2.openssh_forwardOutStreamLocal(remoteSocketPath, (err, remoteSocketStream) => {
                        if (err) {
                            log.Error(err);
                            reject(err);
                            return;
                        }
                        log.Debug(`A connection to the local socket ${localSocketPath} has been established.`);
                        if (localSocketStream != null)
                            remoteSocketStream.pipe(localSocketStream).pipe(remoteSocketStream);
                    });
                })
                    .connect(Object.assign({}, Object.assign({ readyTimeout: 15000 }, sshParameters)));
            });
            process.on("SIGINT", () => { if ((0, fs_1.existsSync)(localSocketPath))
                (0, fs_1.unlinkSync)(localSocketPath); });
            process.on("exit", () => { if ((0, fs_1.existsSync)(localSocketPath))
                (0, fs_1.unlinkSync)(localSocketPath); });
            resolve(server);
        });
    });
}
exports.default = bindRemoteSocketAsync;
//# sourceMappingURL=sockets.js.map