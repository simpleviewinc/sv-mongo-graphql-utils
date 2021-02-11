const fs = require("fs");
const util = require("util");

const readdirP = util.promisify(fs.readdir);

async function readdirRegex(dir, regex) {
	const files = await readdirP(dir);
	const rtn = files.filter((file) => {
		return(file.match(regex) !== null);
	});
	return rtn;
}

module.exports = {
	readdirRegex
}
