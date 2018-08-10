import {CurveTerm} from "./types";
const {toHex}  = require("web3-utils");
import {BigNumber} from "bignumber.js";

/**
 * A class that represents a Zap piecewise curve. Provides the functionality to parse Zap's piecewise function encoding and calculate the price of dots at any given point on the curve.
 */
export class Curve {
    /**@member */
    public values: number[];

    /**
     * Initializes a wrapper class for function and structurizes the provided curves. 
     * @constructor
     * @param {Array<number>} values of curve array
     */
    constructor(curve:number[]=[]) {
        this.values = curve
        this.checkValidity();
        this.structurize();
    }

    /*
     * Checks whether the piecewise curve encoding is valid and throws an error if invalid.
     */
     private checkValidity(): void {
     }

    /**
     * Parses the curve encoding's constants, parts, dividers into an Object representation of the curve.
     */
     private structurize(): void {

    }

    /**
     * Gets the price of the nth dot. e.g. the price of a single dot to a curve with no dots issued would be calculated at n=1. 
     * @param {number} total n, where the new dot will be the nth dot to be bonded. 
     * @returns {number} Returns the price (in Zap) of the nth dot.
     */
     public getPrice(total: number): number {

        return 0;
    }
    public getZapREquire(dots:number):number{
         return 0;
    }

    /**


    /**
     * Converts this curve constants, parts, dividers into Array of Bignumbers
     * @returns {Array<Array<BigNumber>>}
     */
     public convertToBNArrays(): BigNumber[] {
        return this.values.map((item: number) => {
            return toHex(item);
        });

    }

}

export * from "./types";
