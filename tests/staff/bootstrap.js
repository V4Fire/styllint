const { Runner, Content, StylusParser, Rule, Linter } = require("stlint");

const extendsRule = (rulesConstructor) => {
	const linter = new Linter();
	rulesConstructor.prototype = new Rule({ conf: 'always' });
	rulesConstructor.prototype.constructor = rulesConstructor;
	rulesConstructor.prototype.setConfig(linter.config);
};

/**
 * Parse tree AST and apply rule
 *
 * @param text
 * @param rule
 */
const parseAndRun = (text, rule) => {

	const
		content = new Content(text),
		parser = new StylusParser({}),
		ast = parser.parse(content);

	if (rule.checkNode) {
		const
			runner = new Runner(ast, (node) => {
				if (rule.checkNode && rule.isMatchType(node.nodeName)) {
					rule.checkNode(node, content);
				}
			});

		runner.visit(ast, null);
	}

	if (rule.checkLine) {
		splitAndRun(text, rule, content);
	}
};

/**
 * Split content on lines and apply rule on every lines
 *
 * @param text
 * @param rule
 * @param content
 */
const splitAndRun = (text, rule, content = new Content(text)) => {
	if (rule.checkLine) {
		Rule.clearContext();

		content.forEach((line, index) => {
				if (index) {
					Rule.beforeCheckLine(line);
					rule.checkLine && rule.checkLine(line, index, content);
				}
			});
	}
};

/**
 * Check rule only on one line
 *
 * @param line
 * @param rule
 */
const checkLine = (line, rule) => {
	const content = new Content(line);

	return rule.checkLine && rule.checkLine(content.firstLine(), 0, content);
};

global.extendsRule = extendsRule;
global.parseAndRun = parseAndRun;
global.splitAndRun = 	splitAndRun;
global.checkLine = 	checkLine;

