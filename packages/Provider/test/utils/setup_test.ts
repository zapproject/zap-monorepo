import {ProviderHandler} from "../../src/types";


export class providerHandler implements ProviderHandler{
    handleIncoming(res:string){
        console.log(res)
    }
}