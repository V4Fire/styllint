const { expect } = require("chai");
const { useColorFromPreset } = require("../../rules/useColorFromPreset");

let
	wrongContent = '$p = {\n' +
		'\tcolor:c(#F5F5F5)\n' +
		'}\n' +
		'.tab\n\tcolor $p.color';

describe('Test useColorFromPreset', () => {
	beforeEach(() => {
		extendsRule(useColorFromPreset);
	});

	it('Should throw error if use color inside c() has preset', () => {
		const rule = new useColorFromPreset({
			conf: 'always'
		});

		parseAndRun(
			wrongContent,
			rule
		);

		expect(rule.errors.length).to.be.equal(1);
	});
});
