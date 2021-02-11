const fs = require("fs");

/**
 * Finds all files in a folder matching a regex.
 * @param {string} dir - Directory to load files from
 * @param {RegExp} regex - Criteria to match files on
 */
async function readdirRegex(dir, regex) {
	const files = await fs.promises.readdir(dir);
	const rtn = files.filter((file) => {
		return file.match(regex) !== null;
	});
	return rtn;
}

exports.readdirRegex = readdirRegex;