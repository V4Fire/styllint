const path = require('path');
const fs = require('fs');

const distance = (point1, point2) => {
	return Math.sqrt(
		point1.reduce((sum, value, index) => {
			return Math.pow(value - point2[index], 2) + sum;
		}, 0)
	);
};

function useFontFromDS() {
	this.nodesFilter = ['call'];

	const weights = {
		caption: 1,
		body: 5,
		title: 9,

		xs: 1,
		s: 3,
		m: 5,
		l: 7,
		xl: 9,

		regular: 1,
		medium: 5,
		bold: 9
	};

	const calcWeights = (key) => {
		const parts = key
			.toLowerCase()
			.replace(/^[-]+/, '')
			.replace(/[-]+$/, '')
			.replace(/[^a-zA-Z0-9\-]/g, '')
			.replace(/[\-]{2,}/g, '-')
			.split(/-/);

		return parts.map((key) => {
			if (/^[0-9]+$/.test(key)) {
				return parseInt(key, 10);
			}

			if (weights[key]) {
				return weights[key];
			}

			return 0;
		});
	};

	const toKey = (key) => key
		.replace(/[^a-zA-Z0-9–]/g, '-');

	const fromKey = (key) => key
		.replace(/[^a-zA-Z0-9–]/g, ' ')
		.replace(/^([a-zA-Z]+)\s([MLXS]+)/g, '$1/$2');

	const getReplaceFor = (key) => {
		if (this.context.fonts[key]) {
			return;
		}

		const weight = calcWeights(key);

		if (!weight.length) {
			return;
		}

		const keys = Object.keys(this.context.fonts);

		let min = null;

		for (let i = 0; i < keys.length; i += 1) {
			const test = keys[i];
			const testWeight = this.context.fonts[test];

			if (!min || distance(testWeight, weight) < distance(weight, this.context.fonts[min.key])) {
				min = {
					key: test
				};
			}
		}

		if (!min) {
			return null;
		}

		return `t("${fromKey(min.key)}")`;
	};

	const loadFonts = () => {
		try {
			const pzlrPath = path.resolve(this.config.basepath, '.pzlrrc');

			if (!fs.existsSync(pzlrPath)) {
				return;
			}

			const pzlr = JSON.parse(fs.readFileSync(pzlrPath, 'utf8'));

			if (!pzlr || !pzlr.designSystem) {
				return;
			}

			const designSystemFile = path.resolve(this.config.basepath, 'node_modules', pzlr.designSystem, 'index.js');
			if (!fs.existsSync(designSystemFile)) {
				return;
			}

			const designSystem = require(designSystemFile);

			if (designSystem && designSystem.text) {
				this.context.fonts = Object.keys(designSystem.text)
					.reduce((res, key) => {
						res[key] = calcWeights(key);
						return res;
					}, {});
			}

		} catch (e) {
			console.log(e);
		}
	};

	this.checkNode = (node) => {
		if (!this.context.fonts) {
			this.context.fonts = {};

			try {
				loadFonts();
			} catch {

			}
		}

		if (node && node.key.toLowerCase() === 't') {
			const
				value = node.nodes[0].toString(),
				rvalue = toKey(value),
				replace = getReplaceFor(rvalue);

			if (replace) {
				this.msg(`This text-name does not exist. Use ${replace} instead`,
					node.line.lineno,
					node.column,
					node.column + node.toString().length + 1,
					replace
				);
			}
		}
	};
}

module.exports.useFontFromDS = useFontFromDS;
