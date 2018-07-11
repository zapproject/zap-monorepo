import {migrateContracts,ganacheServerOptions,startGanacheServer} from "./../src/migrations"
import {join} from 'path'
import {existsSync, mkdirSync} from 'fs'
describe("Deploy test contracts",()=>{
  let ganacheServer: any ;
    it("should start ganache server",async ()=>{
        ganacheServer = await startGanacheServer();
    })
  it("should migrate all contracts for Zap",async ()=>{
    let testContractsPath = join(__dirname,"contracts")
    if(!existsSync(testContractsPath))
      mkdirSync(testContractsPath);
    await migrateContracts(testContractsPath, ganacheServerOptions)

  });
    after(async ()=>{
      ganacheServer.close()
    })
})
