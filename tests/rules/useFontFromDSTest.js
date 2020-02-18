const { expect } = require("chai");
const { useFontFromDS } = require("../../rules/useFontFromDS");

let
	wrongContent =
		'.tab\n\tt("Heading 1")\n' +
		'.tab2\n\tt("Heading-6")\n';

describe('Test useFontFromDS', () => {
	beforeEach(() => {
		extendsRule(useFontFromDS);
	});

	it('Should throw error if use text-name inside t() not from DS', () => {
		const rule = new useFontFromDS({
			conf: 'always'
		});

		parseAndRun(
			wrongContent,
			rule
		);

		expect(rule.errors.length).to.be.equal(1);
	});
});
