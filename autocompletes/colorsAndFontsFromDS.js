const loadDS = require('../helpers/loadDS');

/**
 * Return suggestions for t( and c( mixin's first attribute
 * @param str
 */
module.exports = function (str) {
	const result = [];

	const mixin = /(t|c)\(("|#|')$/.exec(str);

	if (mixin) {
		const ds = loadDS(this.config.basepath);
		switch (mixin[1]) {
			case 't':
				result.push(...Object.keys(ds.text));
				break;

			case 'c':
				result.push(...Object.keys(ds.colors));
				break;
		}
	}

	return result.map(title => ({
		title
	}));
};
