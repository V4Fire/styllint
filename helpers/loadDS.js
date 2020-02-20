const path = require('path');
const fs = require('fs');

/**
 * Load DS config
 *
 * @param basepath
 * @returns {null}
 */
module.exports = (basepath) => {
	try {
		const pzlrPath = path.resolve(basepath, '.pzlrrc');

		if (!fs.existsSync(pzlrPath)) {
			return;
		}

		const pzlr = JSON.parse(fs.readFileSync(pzlrPath, 'utf8'));

		if (!pzlr || !pzlr.designSystem) {
			return;
		}

		const designSystemFile = path.resolve(basepath, 'node_modules', pzlr.designSystem, 'index.js');
		if (!fs.existsSync(designSystemFile)) {
			return;
		}

		const designSystem = require(designSystemFile);

		if (designSystem) {
			return designSystem;
		}

	} catch (e) {
		console.log(e);
	}

	return null;
};
