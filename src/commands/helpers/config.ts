import { existsSync } from "fs";
import LocalConfig from "../../config/localConfig";
import { ResolveUri } from "../../helper/path";



export function validateOrInitLocalConfigDirectoryWithDefaults() {
    let directories = ['.derrik', '~/.derrik', '~/.config/derrik'].map(d => ResolveUri(d))
    let existingLocations = directories.filter(d => existsSync(d))
    if (existingLocations.length < 1) {
        LocalConfig.InitLocalConfig()
    }
}