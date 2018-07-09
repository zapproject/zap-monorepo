
import {readdirSync,readFileSync,writeFileSync,unlinkSync, existsSync,mkdirSync} from 'fs'
import {join,basename} from 'path'
import { provider, server } from 'ganache-core';
import { promisify } from 'util';
import {ganacheServerOptions,GAS_LIMIT,GAS_PRICE,buildOptions} from './constants';
import {serverOptionsType,buildOptionsType} from "../types";
const migrate = require(join(__dirname,'./../../../node_modules/truffle-core/lib/commands/migrate.js'));
const asyncMigrate = promisify(migrate.run);


export function startGanacheServer(_serverOptions ?: any){
  return new Promise((resolve,reject)=>{
    let serverOptions = _serverOptions || ganacheServerOptions;
    const ganacheServer = server(serverOptions);
    ganacheServer.listen(serverOptions.port, (err, blockchain) => {
    if (err) {
      console.log("server might already is created from other tests");
    }
    return resolve(ganacheServer)
    });
   console.log('server started on port: ' + serverOptions.port);
   return resolve(ganacheServer)
  })
}

export function  clearBuild(onlyRemoveNetworks = true, buildDir:string) {
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

export function getArtifacts(buildDir:string){
    let artifacts = {}
    readdirSync(buildDir).forEach(function (file) {

        /* If its the current file ignore it */
        if (!file.endsWith('.json')) return;

        /* Store module with its name (from filename) */
        artifacts[basename(file, '.json')] = require(join(buildDir, file));
    });
    return artifacts

}

  export async function migrateContracts(buildDir:string,_serverOptions ?:serverOptionsType) {
    console.log("start migrating")
    let serverOpts = _serverOptions || ganacheServerOptions;
    let buildOpts:buildOptionsType = buildOptions;
    buildOpts.contracts_build_directory = buildDir;
    let options = Object.assign(serverOpts,buildOpts);
    try {
      clearBuild(false, buildDir);
      console.log("running all");
      await asyncMigrate(options)
      return true;
    } catch (err) {
      return true;
    }
  }

  export * from "./constants"