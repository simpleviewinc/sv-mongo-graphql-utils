function basicMessageResolver() {
	return function({ message }) {
		return ( message !== undefined ) ? message : "";
	}
}

function countResolver(apiName) {
	return async function({ filter }, args, { apis }, info) {
		return apis[apiName].countDocuments(filter);
	}
}

function docsResolver(apiName) {
	return async function({ filter, options }, args, { apis }, info) {
		return await apis[apiName].find(filter, options).toArray();
	}
}

function findResultResolver(apiName) {
	return {
		success : successResolver(),
		message : basicMessageResolver(),
		docs : docsResolver(apiName),
		count : countResolver(apiName)
	}
}

function mapKeyResolver(key) {
	return function(parent) {
		return parent[key];
	}
}

function successResolver() {
	return function({ success }) {
		return ( success !== undefined ) ? success : true;
	}
}

function upsertResultResolver(apiName) {
	return {
		success : successResolver(),
		message : function(parent, args, { apis }, info) {
			if ( parent.message.trim() !== '' ){ return parent.message; }

			if ( parent.rtn === undefined ) {
				throw new Error("upsertResultResolver 'message' resolver requires 'rtn' to be returned from primary resolver");
			}
			
			const op = parent.rtn.upsertedCount === 1 ? "created" : "updated";
			const message = `${apis[apiName].label} ${op}.`;
			return message;
		},
		doc : async function(parent, args, { apis }, info) {
			if ( parent.success === false ){ return null; }
			if ( parent.filter === undefined ) {
				throw new Error("upsertResultResolver 'doc' resolver requires 'filter' to be returned from primary resolver");
			}
			
			return await apis[apiName].findOne(parent.filter);
		}
	}
}

module.exports = {
	findResultResolver,
	mapKeyResolver,
	upsertResultResolver,
}