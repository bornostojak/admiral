


export default class ProjectEnvironment {
    Name: string = ""

    
    public static Load(path: string) {
        ProjectEnvironment.verifyPresenceInProjectFolder(path)
        let tmp = new ProjectEnvironment()
        tmp.Name = path.split('/').slice(-1)[0]
        return tmp
    }
    
    private static verifyPresenceInProjectFolder(path: string) {

    }
}