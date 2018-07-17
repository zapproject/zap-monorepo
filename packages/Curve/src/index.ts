import {CurveType, CurveTerm} from "./types";
const {toHex}  = require("web3-utils");
import {BigNumber} from 'bignumber.js'
export class Curve {

    constants : Array<number>;
    parts: Array<number>;
    dividers : Array<number>;
    pieces:Array<any>;


    constructor(constants:Array<number>, parts: Array<number>, dividers: Array<number>) {
        this.constants = constants;
        this.parts = parts;
        this.dividers = dividers;
        this.pieces = Array();
        this.structurize();
    }

    /**
     * Turn constants, parts, dividers into curve's coef, power, fn, pieces
     */
    structurize() :void{
        let pStart = 0;

        for (let i = 0; i < this.dividers.length; i++) {
            let piece = Object();
            piece.start = this.parts[2 * i];
            piece.end =  this.parts[(2 * i) + 1];
            piece.terms = Array();
            this.pieces.push(piece);

            for (let j = pStart; j < this.dividers[i]; j++) {
                let term = Object();
                term.coef = this.constants[(3 * j)];
                term.power = this.constants[(3 * j) + 1];
                term.fn = this.constants[(3 * j) + 2];

                this.pieces[i].terms.push(term);
            }

            pStart = this.dividers[i];
        }
    }


    /**
     * Get the price of a dot at a given totalBound
     * @param {number} total bound dots
     * @returns {number}
     */
    getPrice(total:number):number {
        if (total < 0) {
            return 0;
        }

        if (!this.pieces) {
            return 0;
        }

        for (let i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].start <= total && total <= this.pieces[i].end) {
                return this._calculatePolynomial(this.pieces[i].terms, total);
            }
        }

        return 0;
    }

    /**
     * Calculate a curve's term
     * @param {CurveTerm} term
     * @param {number} x
     * @returns {number}
     * @private
     */
    _calculateTerm(term:CurveTerm, x:number) :number{
        let val = 1;

        if (term.fn === 0) {
            if (x < 0) x = -x;
        }  else if (term.fn === 1) {
            if (x < 0) {
                x = 0;
            } else  {
                x = Math.log2(x);
            }
        }

        if (term.power > 0) {
            val = Math.pow(x, term.power);
        }

        return val * term.coef;
    }

    /**
     * Convert this curve constants, parts, dividers into Array of Bignumbers
     * @returns {Array<Array<BigNumber>>}
     */
    convertToBNArrays():Array<Array<BigNumber>> {
        let convertedConstants = this.constants.map((item: number) => {
            return toHex(item);
        });
        let convertedParts = this.parts.map((item: number) => {
            return toHex(item);
        });
        let convertedDividers = this.dividers.map((item: number) => {
            return toHex(item);
        });
        return [convertedConstants, convertedParts, convertedDividers];

    }

    /**
     * Calculate total of terms
     * @param terms
     * @param {number} x
     * @returns {number}
     * @private
     */
    _calculatePolynomial(terms:any, x:number):number {
        let sum = 0;

        for (let i = 0; i < terms.length; i++ ) {
            sum += this._calculateTerm(terms[i], x);
        }

        return sum;
    }
}

export * from "./types";
