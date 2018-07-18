import {ProviderHandler} from "../../src/types";


export class providerHandler implements ProviderHandler {
    handleIncoming(res:any){
        console.log(res)
    }

    handleSubscription(res:any) {
        console.log(res)
    }
}