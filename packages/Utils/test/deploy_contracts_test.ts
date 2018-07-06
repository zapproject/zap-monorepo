import {migrateContracts,ganacheServerOptions} from "./../src/migrations"


describe("Deploy test contracts",()=>{
  it("should migrate all contracts for Zap",async ()=>{
    await migrateContracts(__dirname, ganacheServerOptions)
  //  console.log(artifacts['Bondage'])
  })
})
