const path = require('path');
const fs = require('fs');
const  { Content, StylusParser } = require('stlint');
const  { Call, Ident, RGB } = require('stlint').ast;

function useColorFromPreset() {
	this.nodesFilter = ['call'];

	const vars = [];

	const getKeyForColor = (color) => {
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

	const visitor = (node) => {
		if (node instanceof Ident && /^\$/.test(node.key)) {
			vars[node.key] = node.value.toString().split(/\s/);
		}

		if (node instanceof Call && node.key === 'registerColors') {
			const colors = JSON.parse(node.nodes[0].toString());

			Object.keys(colors).forEach((key) => {
				this.context.colors[key] = colors[key].replace(/^\(/, '').replace(/\)$/, '').split(/\s/);

				if (this.context.colors[key][0] && /^\$/.test(this.context.colors[key][0])) {
					const value = vars[this.context.colors[key][0]];
					this.context.colors[key] = value;
				}
			});

			return;
		}

		if (node.nodes) {
			node.nodes.forEach(visitor);
		}
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

			const designSystem = JSON.parse(fs.readFileSync(designSystemFile, 'utf8'));
			if (designSystem && designSystem.colors) {
				this.context.colors = designSystem.colors;
			}

		} catch(e) {
			console.log(e);
			return;
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
