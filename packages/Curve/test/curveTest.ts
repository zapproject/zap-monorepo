import {Curve} from "./../src";

import {join} from "path";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;

describe('Zap Curve Test"', () => {

	before(function (done) {
    	// do nothing
    	done();
    });

	it("1) Try to initialize a simple curve", async () => {
		let constants = [2,2,0]; // 2x^2
		let parts = [1,100];
		let dividers = [1];
		let curve = new Curve(constants, parts, dividers);
	})

	it("2) Perform a simple calculation", async () => {
		let constants = [2,2,0]; // 2x^2
		let parts = [1,100];
		let dividers = [1];
		let curve = new Curve(constants, parts, dividers);

		var x = 10;
		expect(curve.getPrice(x)).to.equal(2*x**2);
	});

	it("3) Perform calculations with a curve with multiple pieces", async () => {
		let constants = [2,2,0,3,3,0]; // 2x^2, 3x^3
		let parts = [1,10, 10, 50];
		let dividers = [1, 2];
		let curve = new Curve(constants, parts, dividers);

		// test piece 1
		var x = 10;
		expect(curve.getPrice(x)).to.equal(2*x**2);
		// test piece 2
		x = 40;
		expect(curve.getPrice(x)).to.equal(3*x**3);
	});

	it("4) Perform calculations with a curve with multiple parts to a piece", async () => {
		let constants = [2,2,0,3,3,0]; // 2x^2+3x^3
		let parts = [1,10];
		let dividers = [2];
		let curve = new Curve(constants, parts, dividers);
		var x = 5;
		expect(curve.getPrice(x)).to.equal(2*x**2 + 3*x**3);
	});

	it("5) Perform calculations with a curve with multiple parts to multiple pieces", async () => {
		let constants = [2,2,0,3,3,0, 1,1,1, 1,1,0]; // 2x^2+3x^3 , lg(x) + x
		let parts = [1,10, 10, 100];
		let dividers = [2, 4];
		let curve = new Curve(constants, parts, dividers);

		var x = 5;
		expect(curve.getPrice(x)).to.equal(2*x**2 + 3*x**3);
		x = 40;
		expect(curve.getPrice(x)).to.equal(Math.log2(x) + x);
	});

	it("6) Attempt to create curves with incorrect number of arguments", async () => {
		let constants = [2,2,0,3,3,0,1]; // wrong number of constants
		let parts = [1,10,50];
		let dividers = [2];

		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Invalid number of constants arguments/);

		constants = [2,2,0,3,3,0];
		parts = [1,10, 10]; // wrong number of parts
		dividers = [2];
		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/A range must be defined for each constants triplet/);

		constants = [2,2,0,3,3,0];
		parts = [1,10];
		dividers = [1,2];
		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/A range must be defined for each constants triplet/);
	});

	it("7) Attempt to create curves with bad arguments", async () => {
		let constants = [2,-1,0,3,3,0]; // negative power
		let parts = [1,10];
		let dividers = [2];

		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Cannot have a negative power/);

		constants = [2,2,5]; // undefined function
		parts = [1,10]; // wrong number of parts
		dividers = [1];
		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Unknown function encoding/);

		constants = [2,2,0,3,3,0];
		parts = [1,10, 9, 20]; // overlapping ranges
		dividers = [1, 2];
		var bad = function(){ new Curve(constants, parts, dividers); };
		expect(bad).to.throw(/Parts ranges must be continuous/);
	});
});
