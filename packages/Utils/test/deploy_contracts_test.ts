import {migrateContracts,ganacheServerOptions} from "./../src/migrations"
import {join} from 'path'
import {existsSync, mkdirSync} from 'fs'
describe("Deploy test contracts",()=>{
  it("should migrate all contracts for Zap",async ()=>{
    let testContractsPath = join(__dirname,"contracts")
    if(!existsSync(testContractsPath))
      mkdirSync(testContractsPath)
    await migrateContracts(testContractsPath, ganacheServerOptions)

  })
})
