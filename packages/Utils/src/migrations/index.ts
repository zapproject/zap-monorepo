
const fs = require('fs');
import {join} from 'path'
import { provider, server } from 'ganache-core';
import { promisify } from 'util';
const {ganacheServerOptions,GAS_LIMIT,GAS_PRICE} = require('./constants');
const migrate = require('./../../../node_modules/truffle-core/lib/commands/migrate');
const asyncMigrate = promisify(migrate.run);
console.log(migrate)
import {migrationDir, contractsDir} from "zap_contracts"


function startGanacheServer(){
  return new Promise((resolve,reject)=>{
    const ganacheServer = server(ganacheServerOptions);
    ganacheServer.listen(ganacheServerOptions.port, (err, blockchain) => {
    if (err) {
      console.log("server might already is created from other tests");
    }
    return resolve("done")
    });
   console.log('server started on port: ' + ganacheServerOptions.port);
   return resolve("done")
  })
}

function  clearBuild(onlyRemoveNetworks = true, buildDir:string) {
    let files = fs.readdirSync(buildDir+'');

    for (let i = 0; i < files.length; i++) {
        let filePath = buildDir + '/' + files[i];
        if (onlyRemoveNetworks) {
            let compiledJson = JSON.parse(fs.readFileSync(filePath));
            if (!compiledJson.networks) {
                continue;
            }

            compiledJson.networks = {};
            fs.writeFileSync(filePath, JSON.stringify(compiledJson), {flag: 'w'});
            console.log('deployment info for file ' + filePath + ' was cleared.');
        } else {
            try {
                fs.unlinkSync(filePath);
                console.log('file ' + filePath + ' was deleted.');
            } catch (e){ console.error(e); }
        }
    }
}

  async function migrateContracts(buildDir:string,ganacheServerOptions:any) {
    console.log("start migrating")
      const options = {
          logger: console,
          contracts_build_directory: buildDir,
          contracts_directory:contractsDir,
          working_directory: contractsDir,
          migrations_directory: migrationDir,
          network: 'ganache-gui',
          network_id: ganacheServerOptions.network_id,
          hostname: ganacheServerOptions.hostname,
          port: ganacheServerOptions.port,
          gas: GAS_LIMIT,
          gasPrice: GAS_PRICE
      };
      console.log(options)

      try {
          clearBuild(false, buildDir);
          console.log("running all")
          await asyncMigrate(options, (err,res)=>{
            console.log('ran all: ', err,res)
          return Promise.resolve('done');
          });
      } catch (err) {
          throw err;
      }
  }

// startGanacheServer(join(__dirname,"contracts"))
// .then((done)=>{
//   console.log("done :", done)
//   migrateContracts(join(__dirname,"contracts"),ganacheServerOptions)
// })


module.exports = {
  startGanacheServer,
  clearBuild,
  migrateContracts,
  ganacheServerOptions
}
