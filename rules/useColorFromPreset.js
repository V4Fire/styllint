const path = require('path');
const fs = require('fs');
const parse = require('parse-color');

function useColorFromPreset() {
	this.nodesFilter = ['call'];

	const getKeyForColor = (color) => {
		if (this.context.colors[color]) {
			return;
		}

		const rgb = parse(color).rgba;
		if (!rgb) {
			return;
		}


		const keys = Object.keys(this.context.colors);

		for (let i = 0; i < keys.length; i += 1) {
			const colors = this.context.colors[keys[i]];
			for (let j = 0; j < colors.length; j += 1) {
				const test = colors[j];

				if (test === color) {
					return j !== 0 ? `c(${keys[i]}, ${j})` : `c(${keys[i]})`;
				}
			}
		}

		return null;
	};

	const loadColors = () => {
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

			if (designSystem && designSystem.colors) {
				this.context.colors = Object.keys(designSystem.colors).reduce((obj, key) => {
					const value = designSystem.colors[key];

					obj[key] = (Array.isArray(value) ? value : [value]).map((clr) => {
						return parse(clr).rgba;
					});

					return obj;
				}, {});

				console.log(this.context.colors);

			}

		} catch (e) {
			console.log(e);
		}
	};

	this.checkNode = (node) => {
		if (!this.context.colors) {
			this.context.colors = {};

			try {
				loadColors();
			} catch {

			}
		}

		if (node && node.key.toLowerCase() === 'c') {
			const
				color = node.nodes[0].toString(),
				replace = getKeyForColor(color);

			if (replace) {
				this.msg(`Use instead raw color ${color} mixin ${replace}`,
					node.line.lineno,
					node.column,
					node.column + node.toString().length - 1,
					replace
				);
			}
		}
	};
}

module.exports.useColorFromPreset = useColorFromPreset;
