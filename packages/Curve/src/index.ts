import {BigNumber} from "bignumber.js";
import {CurveType} from "@zapjs/types"
/**
 * This class represents a Zap piecewise curve. Provides the functionality to parse Zap's piecewise function encoding and calculate the price of dots at any given point on the curve.
 */
 export class Curve {
     public values: CurveType;
    public max: number|string = 0;

    /**
     * Initializes a wrapper class for function and structurizes the provided curves.
     * @constructor
     * @param {Array<number>} values Curve array
     */
     constructor(term:CurveType=[]) {
         this.values = term;
         this.checkValidity();
     }

    /**
     * Checks whether the piecewise curve encoding is valid and throws an error if invalid.
     */
     private checkValidity(): void {
        var prevEnd:number = 1;
        var index:number = 0;
        // Validate the curve
        if(this.values.length <2){
          throw("Invalid curve length")
        }
        while ( index < this.values.length ) {
            // Validate the length of the piece
            var len:number = Number(this.values[index]);
            if(len <=0) throw ("Invalid piece length");

            // Validate the end index of the piece
            var endIndex:number = index + Number(len) + 1;
            if(endIndex >= this.values.length) throw ("Piece is out of bounds");

            // Validate that the end is continuous
            var end:number|string = Number(this.values[endIndex]);
            if(end <= prevEnd) throw("Piece domains are overlapping");

            prevEnd = end;
            index += len + 2;
        }
        let max = new BigNumber(prevEnd);
        this.max = max.toFixed(0)
    }

    /**
     * Gets the price of the nth dot. e.g. the price of a single dot to a curve with no dots issued would be calculated at n=1.
     * @param {number} total_x n - Where the new dot will be the nth dot to be bonded.
     * @returns {number} Returns the price (in Zap) of the nth dot.
     */
     public getPrice(total_x: number|string): number|string {
        total_x = Number(total_x)
        if (total_x <= 0 || total_x > Number(this.max)) {
            throw("Invalid curve supply position");
        }
        if (!this.values) {
            throw("Curve is not initialized");
        }

        var index:number = 0;
        while(index < this.values.length){
            var len:number = Number(this.values[index]);
            var end:number = Number(this.values[index + len + 1]);

            if(total_x > end){
                // move onto the next piece
                index += len + 2;
                continue;
            }

            // calculate at this piece
            var sum:number = 0;
            for(var i:number=0; i<len; i++){
                var coeff:number = Number(this.values[index + i + 1])
                sum += coeff * Math.pow(total_x, i);
            }
            return (new BigNumber(sum)).toFixed(0);
        }
        return -1;
     }

     // buying n dots starting at the ath dot
     public getZapRequired(a:number, n:number):number|string{
        var sum:BigNumber = new BigNumber(0);
        for(var i:number = a; i<a+n; i++){
            sum.plus(this.getPrice(i));
        }
        return sum.toFixed(0);
     }

    /**
     * Converts this curve constants, parts, dividers into Array of Bignumbers
     * @returns {Array<Array<BigNumber>>}
     */
     public convertToBNArrays(): BigNumber[] {
       let res:BigNumber[] = []
       for(let i of this.values){
         res.push(new BigNumber(i))
       }
       return res
     }

    /**
     * @ignore
     */
    public valuesToString(): string[]{
      let res:string[] =[]
      for(let i of this.values){
         res.push((new BigNumber(i)).toFixed(0))
      }
      return res
     }

 }
