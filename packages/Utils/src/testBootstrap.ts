const {migrate }  = require ('./../node_modules/truffle-core/lib/commands/migrate');

const path = require('path');
const fs = require('fs');
import { provider, server } from 'ganache-core'
import { promisify } from 'util'
import {ganacheServerOptions} from './constants'
const asyncMigrate = promisify(migrate.run);
const zapContractDir = "./../node_modules/zap_contracts/"
class Bootstrap{
    constructor(dirname:string){
        this.buildDir = path.join(dirname,'contracts')
       // initiate and run ganache server
      const ganacheServer = server(ganacheServerOptions);
       ganacheServer.listen(ganacheServerOptions.port, (err, blockchain) => {
           if (err) {
             console.log("server might already is created from other tests")
           }
           if (blockchain) {
               //  console.log(blockchain);
           }
       });
       console.log('server started on port: ' + ganacheServerOptions.port);
       this.provider = provider(ganacheServerOptions);
       this.networkId = ganacheServerOptions.network_id
    }

 clearBuild(onlyRemoveNetworks = true) {
    let files = fs.readdirSync(buildDir+'');

    for (let i = 0; i < files.length; i++) {
        let filePath = this.buildDir + '' + files[i];
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

  async migrateContracts() {
      const options = {
          logger: console,
          contracts_build_directory: this.buildDir,
          contracts_directory: path.join(this.dirname,zapContractDir, "contracts"),
          working_directory: path.join(this.dirname,zapContractDir),
          migrations_directory: path.join(this.dirname,"migrations"),
          network: 'ganache-gui',
          network_id: ganacheServerOptions.network_id,
          provider: this.provider,
          hostname: ganacheServerOptions.hostname,
          port: ganacheServerOptions.port,
          gas: '6721975',
          gasPrice: '10000000',
      };

      try {
          clearBuild(false);
          await asyncMigrate(options);
          return Promise.resolve('done');
      } catch (err) {
          ganacheServer.close();
          throw err;
      }
  }


}


module.exports = Bootstrap
