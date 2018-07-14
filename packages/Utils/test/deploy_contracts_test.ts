const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
import {migrateContracts,ganacheServerOptions,startGanacheServer} from "./../src/migrations"
import {join} from 'path'
import {existsSync, mkdirSync} from 'fs'
describe("Deploy test contracts",()=>{
  let ganacheServer: any ;
    it("should start ganache server",async ()=>{
        ganacheServer = await startGanacheServer();
        expect(ganacheServer).to.be.ok;
    })
  it("should migrate all contracts for Zap",async ()=>{
    let testContractsPath = join(__dirname,"contracts")
    if(!existsSync(testContractsPath))
      mkdirSync(testContractsPath);
    await migrateContracts(testContractsPath, ganacheServerOptions)

  });
    after((done)=>{
      ganacheServer.close()
        console.log("closing server")
        done()
    })
})
