import {provider,server} from 'ganache-core';
const {startGanacheServer} =require("./../src/migrations");
import {join} from "path"

describe("Bootstraping tests utils",()=>{
  it("should start ganache server",()=>{
      startGanacheServer();
  })
})
