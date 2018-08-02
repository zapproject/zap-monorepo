import {CurveTerm} from "./types";
const {toHex}  = require("web3-utils");
import {BigNumber} from "bignumber.js";

/**
 * A class that represents a Zap piecewise curve. Provides the functionality to parse Zap's piecewise function encoding and calculate the price of dots at any given point on the curve.
 */
export class Curve {
    /**@member */
    public constants: number[];
    public parts: number[];
    public dividers: number[];
    public pieces: any[];

    /**
     * Initializes a wrapper class for function and structurizes the provided curves. 
     * @constructor
     * @param {Array<number>} constants An array of format [c0,p0,f0,c1,p1,f1,...], where c0,p0,f0 represent the coefficient, power, and function type (0: absolute value, 1: log base 2) of a piecewise term. 
     * @param {Array<number>} parts An array of format [s0, e0, s1, e1, ...], where s0,e0 represent the continous range (s0, e0] where the matching piecewise piece is defined on. 
     * @param {Array<number>} dividers An array of format [d0, d1, ...], where d0 demarcates the piecewise pieces. e.g. if d0=2, The first two piecewise terms are summed to form the first piecewise piece. 
     */
    constructor(constants: number[], parts: number[], dividers: number[]) {
        this.constants = constants;
        this.parts = parts;
        this.dividers = dividers;
        this.pieces = Array();
        this.checkValidity();
        this.structurize();
    }

    /*
     * Checks whether the piecewise curve encoding is valid and throws an error if invalid.
     */
     private checkValidity(): void {
        if (this.constants.length % 3 != 0) { throw new Error("Invalid number of constants arguments"); }
        for (let i = 0; i < this.constants.length; i++) {
            const c = this.constants[i];
            if (!Number.isInteger(+c)) { throw new Error("Constants must be integers"); }
            if (i % 3 == 1 && c < 0) { throw new Error("Cannot have a negative power"); }
            if (i % 3 == 2 && (c < 0 || c > 1)) { throw new Error("Unknown function encoding"); }
        }
        if (this.parts.length / 2 != this.dividers.length) { throw new Error("A range must be defined for each constants triplet"); }

        let prev = 0;
        for (let i = 0; i < this.parts.length; i++) {
            const p = this.parts[i];
            if (i % 2 == 0) {
                if (i != 0 && p != prev) { throw new Error("Parts ranges must be continuous"); }
            } else {
                if (p <= prev) { throw new Error("Parts ranges must have a positive size"); }
            }
            if (p < 0 || !Number.isInteger(p)) { throw new Error("Parts must be unsigned integers"); }
            prev = p;
        }

        prev = this.dividers[0];
        for (let i = 0; i < this.dividers.length; i++) {
            if (this.dividers[i] <= prev && i != 0) { throw new Error("Dividers must be ascending integers"); }
            if (this.dividers[i] > this.constants.length / 3) { throw new Error("Dividers refer to a non-existent piecewise term"); }
        }

}

    /**
     * Parses the curve encoding's constants, parts, dividers into an Object representation of the curve.
     */
     private structurize(): void {
        let pStart = 0;

        for (let i = 0; i < this.dividers.length; i++) {
            const piece = Object();
            piece.start = this.parts[2 * i];
            piece.end =  this.parts[(2 * i) + 1];
            piece.terms = Array();
            this.pieces.push(piece);

            for (let j = pStart; j < this.dividers[i]; j++) {
                const term = Object();
                term.coef = this.constants[(3 * j)];
                term.power = this.constants[(3 * j) + 1];
                term.fn = this.constants[(3 * j) + 2];

                this.pieces[i].terms.push(term);
            }

            pStart = this.dividers[i];
        }
    }

    /**
     * Gets the price of the nth dot. e.g. the price of a single dot to a curve with no dots issued would be calculated at n=1. 
     * @param {number} total n, where the new dot will be the nth dot to be bonded. 
     * @returns {number} Returns the price (in Zap) of the nth dot.
     */
     public getPrice(total: number): number {
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
     * Calculates an individual term of the curve. Each piece can consist of multiple terms.
     * @param {CurveTerm} term An Object representation of this curve
     * @param {number} x The value (supply) at which the term is computed at.
     * @returns {number} Returns the price (in Zap) of this particular term.
     * @private
     */
     public _calculateTerm(term: CurveTerm, x: number): number {
        let val = 1;

        if (term.fn === 0) { // absolute value
            if (x < 0) { x = -x; }
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
     * Converts this curve constants, parts, dividers into Array of Bignumbers
     * @returns {Array<Array<BigNumber>>}
     */
     public convertToBNArrays(): BigNumber[][] {
        const convertedConstants = this.constants.map((item: number) => {
            return toHex(item);
        });
        const convertedParts = this.parts.map((item: number) => {
            return toHex(item);
        });
        const convertedDividers = this.dividers.map((item: number) => {
            return toHex(item);
        });
        return [convertedConstants, convertedParts, convertedDividers];
    }

    /**
     * Calculates the sum of all terms at the appropriate curve for the nth dot.
     * @param terms Array of term objects
     * @param {number} x The value (supply) at which the term is computed at. 
     * @returns {number} Returns the price (in Zap) of the nth dot.
     * @private
     */
     public _calculatePolynomial(terms: any, x: number): number {
        let sum = 0;

        for (let i = 0; i < terms.length; i++ ) {
            sum += this._calculateTerm(terms[i], x);
        }

        return sum;
    }
}

export * from "./types";
