import { existsSync, readFileSync } from "fs";
import { ResolveUri } from "../helper/path";
import logging from "../logging";
import Config from "./manager";


export interface ISSHCredentials {
    Username: string | undefined;
    Password: string | undefined;
    PrivateKey: string | undefined;
    PublicKey: string| undefined;
}
/**
 * The class responsible for keeping, loading and parsing ssh keys and credentials
 */
export class SSHCredentials implements ISSHCredentials {
    
    public Username: string | undefined;
    public Password: string | undefined;
    public PrivateKey: string | undefined;
    public PublicKey: string | undefined;

    public constructor(config?: Object);
    public constructor(username?: string, password?: string, privateKey?: string, publicKey?: string);
    public constructor(arg1?: string, arg2?: string, arg3?: string, arg4?: string) {
        if (typeof arg1 === "undefined") {
            return
        }
        if (typeof arg1 === "string") {
            this.Username = arg1 as string
            this.Password = arg2 as string
            this.PrivateKey = arg4 as string
            this.PublicKey = arg3 as string
        }
        if (typeof arg1 === "object") {
            this.Username = arg1["username"] ?? undefined
            this.Password = arg1["password"] ?? undefined
            this.PrivateKey = arg1["privateKey"] ?? undefined
            this.PublicKey = arg1["publicKey"] ?? undefined
        }

        if (this.PrivateKey && existsSync(ResolveUri(this.PrivateKey))) {
            this.PrivateKey = readFileSync(ResolveUri(this.PrivateKey)).toString()
        }
        if (this.PublicKey && existsSync(ResolveUri(this.PublicKey))) {
            this.PublicKey = readFileSync(ResolveUri(this.PublicKey)).toString()
        }

    }

    public set username(value: string|undefined) { this.Username = value }
    public set password(value: string|undefined) { this.Password = value }
    public set privateKey(value: string|undefined) { 
        this.PrivateKey = value
        if (this.PrivateKey && existsSync(ResolveUri(this.PrivateKey))) {
            this.PrivateKey = readFileSync(ResolveUri(this.PrivateKey)).toString()
        }
    }
    public set publicKey(value: string|undefined) { 
        this.PublicKey = value
        if (this.PublicKey && existsSync(ResolveUri(this.PublicKey))) {
            this.PublicKey = readFileSync(ResolveUri(this.PublicKey)).toString()
        }
    }
    public get username() : string|undefined { return this.Username }
    public get password() : string|undefined { return this.Password }
    public get privateKey() : string|undefined { return this.PrivateKey }
    public get publicKey() : string|undefined { return this.PublicKey }

    public SSH2Login() {
        return {
            username: this.Username,
            password: this.Password,
            privatekey: this.PrivateKey,
            publickey: this.PublicKey
        }
    }
}
