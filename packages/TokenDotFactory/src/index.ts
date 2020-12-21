import { ApproveType } from '@zapjs/types';

import { utf8ToHex, fromWei, toHex} from 'web3';
import { BaseContract } from '@zapjs/basecontract';
import { ZapBondage } from '@zapjs/bondage';
import { ZapToken } from '@zapjs/zaptoken';
import { ZapRegistry } from '@zapjs/registry';
import { Artifacts } from '@zapjs/artifacts';
import {
    InitDotTokenCurve,
    txid,
    address,
    NetworkProviderOptions,
    DEFAULT_GAS,
    EndpointMethods,
    TokenBondType
} from '@zapjs/types';

export class TokenDotFactory extends BaseContract {
  zapBondage: ZapBondage;
  zapToken: ZapToken;
  zapRegistry: ZapRegistry;

  constructor(options?: NetworkProviderOptions) {
      super(Object.assign(options, { artifactName: 'TOKENDOTFACTORY' }));
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
      from,
      gasPrice,
      gas = DEFAULT_GAS
  }: InitDotTokenCurve, cb?: Function): Promise<txid> {
      console.log(endpoint, symbol, term, from);
      const hex_term: any = [];
      for (const i in term) {
          hex_term[i] = toHex(term[i]);
      }

      const promiEvent = this.contract.methods
          .initializeCurve(utf8ToHex(endpoint), utf8ToHex(symbol), hex_term)
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
   * @param from
   * @param gasPrice
   * @param gas
   */
  async approveToBond({
      zapNum,
      from,
      gasPrice,
      gas = DEFAULT_GAS
  }: ApproveType): Promise<txid> {
      return this.zapToken.approve({
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
      const zapRequired = await this.zapBondage.calcZapForDots({
          provider: this.contract._address,
          endpoint: endpoint,
          dots: dots
      });
      const allowance = await this.zapToken.contract.methods.allowance(
          from,
          this.zapBondage.contract._address
      );
      if (fromWei(zapRequired, 'ether') < fromWei(allowance, 'ether')) {
          throw 'Allowance is smaller than amount Zap required';
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
      const dotAddress = await this.contract.methods
          .getTokenAddress(utf8ToHex(endpoint))
          .call();
      const dotToken = new this.provider.eth.Contract(
          Artifacts['ZAP_TOKEN'].abi,
          dotAddress
      );
      const dotBalance = await dotToken.methods.balanceOf(from).call();
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
      const dotAddress = await this.contract.methods
          .getTokenAddress(utf8ToHex(endpoint))
          .call();
      console.log('dot address ', dotAddress);

      const dotToken = new this.provider.eth.Contract(
          Artifacts['ZAP_TOKEN'].abi,
          dotAddress
      );
      const approved = await dotToken.methods
          .allowance(from, this.contract._address)
          .call();
      console.log('approved ', approved);
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
      const dotAddress = await this.contract.methods
          .getTokenAddress(utf8ToHex(endpoint))
          .call();
      console.log('dot address ', dotAddress);
      return dotAddress;
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
      const dotAddress = await this.contract.methods
          .getTokenAddress(utf8ToHex(endpoint))
          .call();
      const dotToken = new this.provider.eth.Contract(
          Artifacts['ZAP_TOKEN'].abi,
          dotAddress
      );
      const dotBalance = await dotToken.methods.balanceOf(from).call();
      console.log('dot balance ', dotBalance);
      return dotBalance;
  }
}
