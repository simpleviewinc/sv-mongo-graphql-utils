const { ObjectId } = require("mongodb");

function createFilter(filter = {}) {
	const newFilter = {};
	
	for(var i in filter) {
		if (i === "id") {
			newFilter._id = filter[i];
		} else {
			newFilter[i] = filter[i];
		}
	}
	
	return newFilter;
}

function createOptions(options = {}) {
	const newOptions = {};
	
	if (options.limit !== undefined) {
		newOptions.limit = options.limit;
	}
	
	if (options.skip !== undefined) {
		newOptions.skip = options.skip;
	}
	
	if (options.sort !== undefined) {
		const sort = {};
		options.sort.forEach(function(val, i) {
			if(val.field === undefined){ throw new Error(`sort field ${i} must be defined`); }

			if(val.dir === undefined){ throw new Error(`${val.field} sort direction must be defined`); }

			sort[val.field] = val.dir === "asc" ? 1 : -1;
		});
		
		newOptions.sort = sort;
	}
	
	return newOptions;
}

function setUnsetKey({ options, key, value }) {
	if (value === undefined) {
		options.$unset = options.$unset || {};
		options.$unset[key] = "";
	} else {
		options.$set = options.$set || {};
		options.$set[key] = value;
	}
}

function testId(str) {
	if(typeof str !== 'string'){ throw new Error('str must be a string'); }

	const encoded = Buffer.from(str).toString("hex");
	const padded = encoded.padStart(24, "0");
	return ObjectId(padded);
}

module.exports = {
	createFilter,
	createOptions,
	setUnsetKey,
	testId,
}