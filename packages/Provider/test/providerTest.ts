const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
import {join} from 'path'
import {existsSync,mkdirSync} from 'fs'
import {migrateContracts,startGanacheServer} from '@zap/utils'
let Utils = require( '@zap/utils')
describe("Provider tests",()=>{

  before(()=>{
      startGanacheServer()
  })
  it("should migrate contracts from utils tool", async ()=>{
    let testContractsPath = join(__dirname,"contracts")
    if(!existsSync(testContractsPath))
      mkdirSync(testContractsPath)
    let contracts = await migrateContracts(testContractsPath)
    
  })
  it("should create new provider",async ()=>{

  })
})
