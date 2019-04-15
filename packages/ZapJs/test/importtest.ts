const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
import {ZapWeb3} from "../src"


describe('TokenDotFactory test', () => {
  it("should resolve web3",()=>{
    expect(ZapWeb3).to.be.ok
    const test = require("../src").ZapWeb3
    expect(test).to.be.ok
  })
})
