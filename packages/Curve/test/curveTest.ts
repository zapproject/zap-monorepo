import {Curve} from "./../src";

const expect = require("chai")
.use(require("chai-as-promised"))
.use(require("chai-bignumber"))
.expect;

describe('Zap Curve Test"', function() {

	it("1) Try to initialize a simple curve", async () => {
		const constants = [2, 2, 0]; // 2x^2
		const parts = [1, 100];
		const dividers = [1];
		const curve = new Curve(constants, parts, dividers);
	});

	it("2) Perform a simple calculation", async () => {
		const constants = [2, 2, 0]; // 2x^2
		const parts = [1, 100];
		const dividers = [1];
		const curve = new Curve(constants, parts, dividers);

		const x = 10;
		expect(curve.getPrice(x)).to.equal(2 * x ** 2);
	});

	it("3) Perform calculations with a curve with multiple pieces", async () => {
		const constants = [2, 2, 0, 3, 3, 0]; // 2x^2, 3x^3
		const parts = [1, 10, 10, 50];
		const dividers = [1, 2];
		const curve = new Curve(constants, parts, dividers);

		// test piece 1
		let x = 10;
		expect(curve.getPrice(x)).to.equal(2 * x ** 2);
		// test piece 2
		x = 40;
		expect(curve.getPrice(x)).to.equal(3 * x ** 3);
	});

	it("4) Perform calculations with a curve with multiple parts to a piece", async () => {
		const constants = [2, 2, 0, 3, 3, 0]; // 2x^2+3x^3
		const parts = [1, 10];
		const dividers = [2];
		const curve = new Curve(constants, parts, dividers);
		const x = 5;
		expect(curve.getPrice(x)).to.equal(2 * x ** 2 + 3 * x ** 3);
	});

	it("5) Perform calculations with a curve with multiple parts to multiple pieces", async () => {
		const constants = [2, 2, 0, 3, 3, 0, 1, 1, 1, 1, 1, 0]; // 2x^2+3x^3 , lg(x) + x
		const parts = [1, 10, 10, 100];
		const dividers = [2, 4];
		const curve = new Curve(constants, parts, dividers);

		let x = 5;
		expect(curve.getPrice(x)).to.equal(2 * x ** 2 + 3 * x ** 3);
		x = 40;
		expect(curve.getPrice(x)).to.equal(Math.log2(x) + x);
	});

	it("6) Attempt to create curves with incorrect number of arguments", async () => {
		let constants = [2, 2, 0, 3, 3, 0, 1]; // wrong number of constants
		let parts = [1, 10, 50];
		let dividers = [2];

		let bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Invalid number of constants arguments/);

		constants = [2, 2, 0, 3, 3, 0];
		parts = [1, 10, 10]; // wrong number of parts
		dividers = [2];
		bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/A range must be defined for each constants triplet/);

		constants = [2, 2, 0, 3, 3, 0];
		parts = [1, 10];
		dividers = [1, 2];
		bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/A range must be defined for each constants triplet/);
	});

	it("7) Attempt to create curves with bad arguments", async () => {
		let constants = [2, -1, 0, 3, 3, 0]; // negative power
		let parts = [1, 10];
		let dividers = [2];

		let bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Cannot have a negative power/);

		constants = [2, 2, 5]; // undefined function
		parts = [1, 10]; // wrong number of parts
		dividers = [1];
		bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Unknown function encoding/);

		constants = [2, 2, 0, 3, 3, 0];
		parts = [1, 10, 9, 20]; // overlapping ranges
		dividers = [1, 2];
		bad = function() { new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Parts ranges must be continuous/);
	});
});
