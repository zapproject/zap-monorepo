
const {readdirSync,readFileSync,writeFileSync,unlinkSync, existsSync,mkdirSync} =require('fs');
import {join,basename} from 'path'
const { provider, server } = require('ganache-core');
import { promisify } from 'util';
import {ganacheServerOptions,DEFAULT_GAS,GAS_PRICE,buildOptions,migrate} from '../constants';
import {serverOptionsType,buildOptionsType} from "../types";
const asyncMigrate = promisify(migrate.run);


/**
 * @ignore
 * @param _serverOptions
 * @returns {Promise<any>}
 */
export function startGanacheServer(_serverOptions ?: any){
  return new Promise((resolve,reject)=>{
    let serverOptions = _serverOptions || ganacheServerOptions;
    const ganacheServer = server(serverOptions);
    ganacheServer.listen(serverOptions.port, (err:any, blockchain:any) => {
    if (err) {
        console.error(err)
      console.log("server might already is created from other tests");
        ganacheServer.close()
        return reject(err)
    }
        console.log('server started on port: ' + serverOptions.port);
        return resolve(ganacheServer)
    });
  })
}

/**
 * @ignore
 * @param {boolean} onlyRemoveNetworks
 * @param {string} buildDir
 */
export function clearBuild(onlyRemoveNetworks = true, buildDir:string) {
    if(!existsSync(buildDir)){
        mkdirSync(buildDir)
    }
    let files = readdirSync(buildDir+'');

    for (let i = 0; i < files.length; i++) {
        let filePath = buildDir + '/' + files[i];
        if (onlyRemoveNetworks) {
            let compiledJson = JSON.parse(readFileSync(filePath));
            if (!compiledJson.networks) {
                continue;
            }

            compiledJson.networks = {};
            writeFileSync(filePath, JSON.stringify(compiledJson), {flag: 'w'});
            console.log('deployment info for file ' + filePath + ' was cleared.');
        } else {
            try {
                if(filePath.endsWith('.json')){
                unlinkSync(filePath);
                console.log('file ' + filePath + ' was deleted.');
              }
            } catch (e){ console.error(e); }
        }
    }
}

/**
 * @ignore
 * @param {string} buildDir
 * @returns {any}
 */
export function getArtifacts(buildDir:string){
    let artifacts:any = {};
    readdirSync(buildDir).forEach(function (file:string) {

        /* If its the current file ignore it */
        if (!file.endsWith('.json')) return;

        /* Store module with its name (from filename) */
        artifacts[basename(file, '.json')] = require(join(buildDir, file));
    });
    return artifacts

}

/**
 * @ignore
 * @param {string} buildDir
 * @param {serverOptionsType} _serverOptions
 * @returns {Promise<boolean>}
 */
  export async function migrateContracts(buildDir:string,_serverOptions ?:serverOptionsType) {
    console.log("start migrating")
    let serverOpts = _serverOptions || ganacheServerOptions;
    let buildOpts:buildOptionsType = buildOptions;
    buildOpts.contracts_build_directory = buildDir;
    let options = Object.assign(serverOpts,buildOpts);
    try {
      clearBuild(false, buildDir);
      console.log("running all");
      await asyncMigrate(options);
      return true;
    } catch (err) {
      console.error(err)
      return true;
    }
  }

  export * from "../constants"
