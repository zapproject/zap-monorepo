const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
import {migrateContracts,ganacheServerOptions,startGanacheServer} from "./../src/migrations"
import {join} from 'path'
import {existsSync, mkdirSync} from 'fs'
async function sleep(ms:number){return new Promise(resolve)=>{setTimeout(resolve,ms)}}
describe("Testing deployment of test contracts",()=>{
  let ganacheServer: any ;
  it("Should start ganache server",async ()=>{
    ganacheServer = await startGanacheServer();
    expect(ganacheServer).to.be.ok;
  })
  it("Should migrate all Zap contracts",async ()=>{
    let testContractsPath = join(__dirname,"contracts")
    if(!existsSync(testContractsPath))
      mkdirSync(testContractsPath);
    await migrateContracts(testContractsPath, ganacheServerOptions)

  });
  it("should close ganache server", async ()=>{
    ganacheServer.close();
    await sleep()
    console.log("Closing server");
  })
})
