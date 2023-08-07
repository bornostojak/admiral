import LocalConfig from "./localConfig";
import  ProjectConfig from "./project/config";
import logging from "../logging"

let log = new logging("Config loading")

export {
    LocalConfig,
    ProjectConfig
}
