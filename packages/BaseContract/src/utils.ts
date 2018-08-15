import {join} from "path";
export class Utils {
    /**
     * @ignore
     * @param {string} buildDir
     * @returns {any}
     */
    static getArtifacts(buildDir: string) {
        let artifacts: any = {};
        artifacts = {
            Arbiter: require(join(buildDir, "Arbiter.json")),
            Bondage: require(join(buildDir,"Bondage.json")),
            Dispatch: require(join(buildDir,"Dispatch.json")),
            Registry: require(join(buildDir,"Registry.json")),
            CurrentCost: require(join(buildDir,"CurrentCost.json")),
            PiecewiseLogic: require(join(buildDir,"PiecewiseLogic.json")),
            ZapToken: require(join(buildDir,"ZapToken.json")),
            Client1: require(join(buildDir,"Client1.json")),
            Client2: require(join(buildDir,"Client2.json")),
            Client3: require(join(buildDir,"Client3.json")),
            Client4: require(join(buildDir,"Client4.json")),
        }
        return artifacts

    }
}