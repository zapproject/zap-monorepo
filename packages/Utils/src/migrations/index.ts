
import {readdirSync,readFileSync,writeFileSync,unlinkSync} from 'fs'
import {join,basename} from 'path'
import { provider, server } from 'ganache-core';
import { promisify } from 'util';
const {ganacheServerOptions,GAS_LIMIT,GAS_PRICE} = require('./constants');
const migrate = require(join(__dirname,'./../../../node_modules/truffle-core/lib/commands/migrate.js'));
const asyncMigrate = promisify(migrate.run);
const  migrationDir = join(__dirname,'./../../../node_modules/zap_contracts/migrations')
const contractsDir = join(__dirname,'./../../../node_modules/zap_contracts/contracts')
const workingDir = join(__dirname,'./../../../node_modules/zap_contracts')


export function startGanacheServer(_serverOptions ?: any){
  return new Promise((resolve,reject)=>{
    let serverOptions = _serverOptions || ganacheServerOptions;
    const ganacheServer = server(serverOptions);
    ganacheServer.listen(serverOptions.port, (err, blockchain) => {
    if (err) {
      console.log("server might already is created from other tests");
    }
    return resolve("done")
    });
   console.log('server started on port: ' + serverOptions.port);
   return resolve("done")
  })
}

export function  clearBuild(onlyRemoveNetworks = true, buildDir:string) {
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

export function getContracts(buildDir:string){
  let artifacts = {}
  readdirSync(buildDir).forEach(function (file) {

    /* If its the current file ignore it */
    if (!file.endsWith('.json')) return;

    /* Store module with its name (from filename) */
    artifacts[basename(file, '.json')] = require(join(buildDir, file));
  });
  return artifacts

}

  export async function migrateContracts(buildDir:string,_serverOptions ?:any) {
    console.log("start migrating")
    let serverOptions = _serverOptions || ganacheServerOptions
      const options = {
          logger: console,
          contracts_build_directory: buildDir,
          contracts_directory:contractsDir,
          working_directory: workingDir,
          migrations_directory: migrationDir,
          network: 'ganache-gui',
          network_id: serverOptions.network_id,
          hostname: serverOptions.hostname,
          port: serverOptions.port,
          gas: GAS_LIMIT,
          gasPrice: GAS_PRICE
      };
      console.log(options)

      try {
          clearBuild(false, buildDir);
          console.log("running all")
          await asyncMigrate(options, (err,res)=>{
            console.log('ran all: ', err,res)
          return getContracts(buildDir)
          });
      } catch (err) {
          throw err;
      }
  }
