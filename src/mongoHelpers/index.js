const { ObjectId } = require("mongodb");

function createFilter(filter = {}) {
	const newFilter = {};
	
	function initArr(name) {
		newFilter[name] = newFilter[name] || [];
	}
	
	for(let [key, val] of Object.entries(filter)) {
		if (key === "id") {
			newFilter._id = val;
		} else if (key === "WHERE") {
			// WHERE clauses push to an $and array to avoid conflicts with existing filters on existing keys
			initArr("$and");
			const andFilter = {};
			for(let [key2, val2] of Object.entries(val)) {
				andFilter[key2] = {};
				for(let [key3, val3] of Object.entries(val2)) {
					andFilter[key2][`$${key3}`] = val3;
				}
			}
			newFilter["$and"].push(andFilter);
		} else if (key === "OR") {
			initArr("$or");
			for(let [key2, val2] of Object.entries(val)) {
				const orFilter = createFilter(val2);
				newFilter["$or"].push(orFilter);
			}
		} else if (key === "AND") {
			initArr("$and");
			for(let [key2, val2] of Object.entries(val)) {
				const andFilter = createFilter(val2);
				newFilter["$and"].push(andFilter);
			}
		} else if (key === "$or") {
			initArr("$or");
			newFilter["$or"].push(...val);
		} else if (key === "$and") {
			initArr("$and");
			newFilter["$and"].push(...val);
		} else {
			newFilter[key] = val;
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
	return new ObjectId(padded);
}

/**
 * @type {import("../types").pickDefined}
 */
const pickDefined = function(obj, keys) {
	const temp = {};
	for (let key of keys) {
		if (obj[key] !== undefined) {
			temp[key] = obj[key];
		}
	}

	return temp;
}

module.exports = {
	createFilter,
	createOptions,
	pickDefined,
	setUnsetKey,
	testId,
}