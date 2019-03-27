import {Curve} from "./../src";
import {CurveType} from "@zapjs/types"
const expect = require("chai")
.use(require("chai-as-promised"))
.use(require("chai-bignumber"))
.expect;

describe('Zap Curve Test', function() {
    let terms: CurveType;
    let curve:Curve


    it("1) Try to initialize a simple curve", () => {
		terms = [3,0,2,1,100]; // y=2x+x^2 from [1,100]
		curve = new Curve(terms);
	});

	it("2) Perform a simple calculation", () => {

		const curve = new Curve(terms);

		const x = 10;
		//expect(curve.getPrice(x)).to.equal(2 * x ** 2);
	});

	it("3) Perform calculations with a curve with multiple pieces", () => {
		terms  = [4, 0, 1, 0, 1, 100000]; // x+xx^3 range [1,100000]
		curve = new Curve(terms);

		// test piece 1
		let x = 10;
		//expect(curve.getPrice(x)).to.equal(2 * x ** 2);
		// test piece 2
		x = 40;
		//expect(curve.getPrice(x)).to.equal(3 * x ** 3);
	});

	it("4) Perform calculations with a curve with multiple parts to a piece", () => {
		terms = [4,0,0,2,3,100000]; // 2x^2+3x^3
		curve = new Curve(terms);
		const x = 5;
		//expect(curve.getPrice(x)).to.equal(2 * x ** 2 + 3 * x ** 3);
	});

	it("5) Perform calculations with a curve with multiple parts to multiple pieces", () => {

	});

	it("6) Attempt to create curves with incorrect number of arguments", () => {
		terms = [2, 2, 0, 3, 3, 0, 1]; // wrong number of constants


		let bad = function() { new Curve(terms); };
		//expect(bad).to.throw(/Invalid number of constants arguments/);

	});

	it("7) Attempt to create curves with bad arguments", () => {

	});
});
