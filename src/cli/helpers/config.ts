import { existsSync } from "fs";
import LocalConfig from "../../lib/localConfig";
import { ResolveUri } from "../../lib/helpers/path";



export function validateOrInitLocalConfigDirectoryWithDefaults() {
    let directories = ['.admiral', '~/.admiral', '~/.config/admiral'].map(d => ResolveUri(d))
    let existingLocations = directories.filter(d => existsSync(d))
    if (existingLocations.length < 1) {
        LocalConfig.InitLocalConfig()
    }
}