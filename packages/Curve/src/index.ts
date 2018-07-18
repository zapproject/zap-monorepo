import {CurveType, CurveTerm} from "./types";
const {toHex}  = require("web3-utils");
import {BigNumber} from 'bignumber.js'


/**
 * Calculate Curve functions
 */
export class Curve {
    /**@member */
    constants : Array<number>;
    parts: Array<number>;
    dividers : Array<number>;
    pieces:Array<any>;

    /**
     * @constructor
     * @param {Array<number>} constants
     * @param {Array<number>} parts
     * @param {Array<number>} dividers
     */
    constructor(constants:Array<number>, parts: Array<number>, dividers: Array<number>) {
        this.constants = constants;
        this.parts = parts;
        this.dividers = dividers;
        this.pieces = Array();
        this.checkValidity();
        this.structurize();
    }

    /*
     * Checks that the piecewise curve encoding is valid. Throws an error if not
     */
     checkValidity():void {
        if(this.constants.length % 3 != 0) throw new Error("Invalid number of constants arguments");
        for(var i=0; i<this.constants.length; i++){
            let c = this.constants[i];
            if(!Number.isInteger(+c)) throw new Error("Constants must be integers");
            if(i % 3 == 1 && c < 0) throw new Error("Cannot have a negative power");
            if(i % 3 == 2 && (c < 0 || c > 1)) throw new Error("Unknown function encoding");
        }
        if(this.parts.length / 2 != this.dividers.length) throw new Error("A range must be defined for each constants triplet");

        var prev = 0;
        for(var i=0; i<this.parts.length; i++){
            var p = this.parts[i];
            if(i%2 == 0){
                if(i!= 0 && p != prev) throw new Error("Parts ranges must be continuous");
            } else {
                if(p <= prev) throw new Error("Parts ranges must have a positive size");
            }
            if(p < 0 || !Number.isInteger(p)) throw new Error("Parts must be unsigned integers");
            prev = p;
        }

        prev = this.dividers[0];
        for(var i=0;i<this.dividers.length; i++){
            if(this.dividers[i] <= prev && i!=0) throw new Error("Dividers must be ascending integers");
            if(this.dividers[i] > this.constants.length/3) throw new Error("Dividers refer to a non-existent piecewise term");
        }

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

        if (term.fn === 0) { // absolute value
            if (x < 0) x = -x;
        }  else if (term.fn === 1) { // log
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
