"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHCredentials = void 0;
const fs_1 = require("fs");
const path_1 = require("../helper/path");
/**
 * The class responsible for keeping, loading and parsing ssh keys and credentials
 */
class SSHCredentials {
    constructor(arg1, arg2, arg3, arg4) {
        var _a, _b, _c, _d;
        if (typeof arg1 === "undefined") {
            return;
        }
        if (typeof arg1 === "string") {
            this.Username = arg1;
            this.Password = arg2;
            this.PrivateKey = arg4;
            this.PublicKey = arg3;
        }
        else if (arg1 instanceof SSHCredentials) {
            let { Username, Password, PrivateKey, PublicKey } = arg1, _ = __rest(arg1, ["Username", "Password", "PrivateKey", "PublicKey"]);
            Object.assign(this, { Username, Password, PrivateKey, PublicKey });
        }
        else if (typeof arg1 === "object") {
            this.Username = (_a = arg1["username"]) !== null && _a !== void 0 ? _a : undefined;
            this.Password = (_b = arg1["password"]) !== null && _b !== void 0 ? _b : undefined;
            this.PrivateKey = (_c = arg1["privateKey"]) !== null && _c !== void 0 ? _c : undefined;
            this.PublicKey = (_d = arg1["publicKey"]) !== null && _d !== void 0 ? _d : undefined;
        }
        if (this.PrivateKey && (0, fs_1.existsSync)((0, path_1.ResolveUri)(this.PrivateKey))) {
            this.PrivateKey = (0, fs_1.readFileSync)((0, path_1.ResolveUri)(this.PrivateKey)).toString();
        }
        if (this.PublicKey && (0, fs_1.existsSync)((0, path_1.ResolveUri)(this.PublicKey))) {
            this.PublicKey = (0, fs_1.readFileSync)((0, path_1.ResolveUri)(this.PublicKey)).toString();
        }
    }
    set username(value) { this.Username = value; }
    set password(value) { this.Password = value; }
    set privateKey(value) {
        this.PrivateKey = value;
        if (this.PrivateKey && (0, fs_1.existsSync)((0, path_1.ResolveUri)(this.PrivateKey))) {
            this.PrivateKey = (0, fs_1.readFileSync)((0, path_1.ResolveUri)(this.PrivateKey)).toString();
        }
    }
    set publicKey(value) {
        this.PublicKey = value;
        if (this.PublicKey && (0, fs_1.existsSync)((0, path_1.ResolveUri)(this.PublicKey))) {
            this.PublicKey = (0, fs_1.readFileSync)((0, path_1.ResolveUri)(this.PublicKey)).toString();
        }
    }
    get username() { return this.Username; }
    get password() { return this.Password; }
    get privateKey() { return this.PrivateKey; }
    get publicKey() { return this.PublicKey; }
    SSH2Login() {
        return {
            username: this.Username,
            password: this.Password,
            privatekey: this.PrivateKey,
            publickey: this.PublicKey
        };
    }
}
exports.SSHCredentials = SSHCredentials;
//# sourceMappingURL=ssh.js.map