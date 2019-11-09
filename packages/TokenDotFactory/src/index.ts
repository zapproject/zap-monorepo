import { ApproveType } from "@zapjs/types";

const { utf8ToHex, fromWei, toHex, toBN, BN } = require("web3-utils");
import { BaseContract } from "@zapjs/basecontract";
import { ZapBondage } from "@zapjs/bondage";
import { ZapToken } from "@zapjs/zaptoken";
import { ZapRegistry } from "@zapjs/registry";
import { Artifacts } from "@zapjs/artifacts";
import {
  InitDotTokenCurve,
  txid,
  address,
  NetworkProviderOptions,
  DEFAULT_GAS,
  EndpointMethods,
  TokenBondType
} from "@zapjs/types";

export class TokenDotFactory extends BaseContract {
  zapBondage: ZapBondage;
  zapToken: ZapToken;
  zapRegistry: ZapRegistry;

  constructor(options?: NetworkProviderOptions) {
    super(Object.assign(options, { artifactName: "TOKENDOTFACTORY" }));
    this.zapToken = new ZapToken(options);
    this.zapBondage = new ZapBondage(options);
    this.zapRegistry = new ZapRegistry(options);
  }

  /**
   * Initiate Token Endpoint, return address of the new Token Contract
   * @param endpoint
   * @param symbol
   * @param term
   * @param from
   * @param gasPrice
   * @param gas
   */
  async initializeTokenCurve({
    endpoint,
    symbol,
    term,
		token='0x0',
		from,
    gasPrice,
    gas = DEFAULT_GAS
  }: InitDotTokenCurve, cb?: Function): Promise<txid> {
    console.log(endpoint, symbol, term, from);
    let hex_term: any = [];
    for (let i in term) {
      hex_term[i] = toHex(term[i]);
    }

    const promiEvent = this.contract.methods
      .initializeCurve(utf8ToHex(endpoint), utf8ToHex(symbol), hex_term, token)
      .send({ from: from, gas, gasPrice });
      
    if (cb) {
      promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
      promiEvent.on('error', (error: any) => cb(error));
    }
        
    return promiEvent;
  }

  /**
   * Approve to bond as normal
   * @param zapNum
   * @param endpoint 
   * @param from
   * @param gasPrice
   * @param gas
   */
  async approveToBond({
    zapNum,
		endpoint=null,
		from,
    gasPrice,
    gas = DEFAULT_GAS
  }: any): Promise<txid> {
		let reserveAddress;
		if ( endpoint ) {
			reserveAddress = await this.contract.methods
				.getReserveAddress(utf8ToHex(endpoint))
				.call();
		}
		else {
			reserveAddress = Artifacts["ZAP_TOKEN"].address; 
		}

		let reserveToken = new this.provider.eth.Contract(
			Artifacts["ZAP_TOKEN"].abi,
			reserveAddress
		);

		return reserveToken.approve({
      to: this.contract._address,
      amount: zapNum,
      from,
      gas,
      gasPrice
    });
  }

  /**
   * Bond to Token Dot Endpoint
   * @param endpoint
   * @param dots
   * @param from
   * @param gasPrice
   * @param gas
   */
  async bondTokenDot({
    endpoint,
    dots,
    from,
    gasPrice,
    gas = DEFAULT_GAS
  }: TokenBondType, cb?: Function): Promise<txid> {
    let zapRequired = await this.zapBondage.calcZapForDots({
      provider: this.contract._address,
      endpoint: endpoint,
      dots: dots
    });

		let reserveAddress = await this.contract.methods
      .getReserveAddress(utf8ToHex(endpoint))
      .call();

		let reserveToken = new this.provider.eth.Contract(
      Artifacts["ZAP_TOKEN"].abi,
     	reserveAddress 
    );
		
		let allowance = await reserveToken.contract.methods.allowance(
      from,
     	this.contract.address 
    );
    if (fromWei(zapRequired, "ether") < fromWei(allowance, "ether")) {
      throw "Allowance is smaller than amount Zap required";
    }
    const promiEvent = this.contract.methods
      .bond(utf8ToHex(endpoint), dots)
      .send({ from, gas, gasPrice });

    if (cb) {
      promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
      promiEvent.on('error', (error: any) => cb(error));
    }
        
    return promiEvent;
  }

  /**
   * Approve big amount of token for burning Dot Tokens
   * @param endpoint
   * @param from
   * @param gasPrice
   * @param gas
   */
  async approveBurnTokenDot({
    endpoint,
    from,
    gasPrice,
    gas = DEFAULT_GAS
  }: EndpointMethods, cb?: Function): Promise<txid> {
    let dotAddress = await this.contract.methods
      .getTokenAddress(utf8ToHex(endpoint))
      .call();
    let dotToken = new this.provider.eth.Contract(
      Artifacts["ZAP_TOKEN"].abi,
      dotAddress
    );
    let dotBalance = await dotToken.methods.balanceOf(from).call();
    //Approval hangs. Should be approving token.approve for dot-token which has just been created by initializeCurve. Currently hangs
    const promiEvent = dotToken.methods
      .approve(this.contract._address, 9999999999999)
      .send({ from, gas, gasPrice });

    if (cb) {
      promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
      promiEvent.on('error', (error: any) => cb(error));
    }
        
    return promiEvent;
  }

  /**
   * Unbond Dots from Token Endpoint
   * @param endpoint
   * @param dots
   * @param from
   * @param gasPrice
   * @param gas
   */
  async unbondTokenDot({
    endpoint,
    dots,
    from,
    gasPrice,
    gas = DEFAULT_GAS
  }: TokenBondType, cb?: Function): Promise<txid> {
    let dotAddress = await this.contract.methods
      .getTokenAddress(utf8ToHex(endpoint))
      .call();
    console.log("dot address ", dotAddress);

    let dotToken = new this.provider.eth.Contract(
      Artifacts["ZAP_TOKEN"].abi,
      dotAddress
    );
    let approved = await dotToken.methods
      .allowance(from, this.contract._address)
      .call();
    console.log("approved ", approved);
    const promiEvent = this.contract.methods
      .unbond(utf8ToHex(endpoint), dots)
      .send({ from, gas, gasPrice });
    if (cb) {
      promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
      promiEvent.on('error', (error: any) => cb(error));
    }
        
    return promiEvent;
  }

  /**
   * Get Address of certain Token Endpoint
   * @param endpoint
   */
  async getDotAddress(endpoint: string): Promise<txid> {
    let dotAddress = await this.contract.methods
      .getTokenAddress(utf8ToHex(endpoint))
      .call();
    console.log("dot address ", dotAddress);
    return dotAddress;
  }

  /**
   * Get Address of token required for bonding 
   * @param endpoint
   */
  async getReserveAddress(endpoint: string): Promise<txid> {
    let reserveAddress = await this.contract.methods
      .getReserveAddress(utf8ToHex(endpoint))
      .call();
    console.log("reserve address ", reserveAddress);
    return reserveAddress;
  }

  /**
   * Get Token Dot balance
   * @param endpoint
   * @param from
   */
  async getDotTokenBalance({
    endpoint,
    from
  }: {
    endpoint: string;
    from: address;
  }): Promise<txid> {
    let dotAddress = await this.contract.methods
      .getTokenAddress(utf8ToHex(endpoint))
      .call();
    let dotToken = new this.provider.eth.Contract(
      Artifacts["ZAP_TOKEN"].abi,
      dotAddress
    );
    let dotBalance = await dotToken.methods.balanceOf(from).call();
    console.log("dot balance ", dotBalance);
    return dotBalance;
  }

  /**
   * Get reserve token balance
   * @param endpoint
   * @param from
   */
  async getReserveTokenBalance({
    endpoint,
    from
  }: {
    endpoint: string;
    from: address;
  }): Promise<txid> {

		let reserveAddress = await this.contract.methods
      .getReserveAddress(utf8ToHex(endpoint))
      .call();
    let reserveToken = new this.provider.eth.Contract(
      Artifacts["ZAP_TOKEN"].abi,
     	reserveAddress 
    );

    let reserveBalance = await reserveToken.methods.balanceOf(from).call();
    console.log("dot balance ", reserveBalance);
    return reserveBalance;
  }
}
