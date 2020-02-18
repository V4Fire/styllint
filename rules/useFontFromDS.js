const path = require('path');
const fs = require('fs');

function useFontFromDS() {
	this.nodesFilter = ['call'];

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
				this.context.fonts = designSystem.text;
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
				replace = this.context.fonts[value.replace(/[^a-zA-Z0-9–]/g, '-')];

			if (!replace) {
				this.msg(`This text-name does not exists`,
					node.line.lineno,
					node.column,
					node.column + node.toString().length - 1,
				);
			}
		}
	};
}

module.exports.useFontFromDS = useFontFromDS;
