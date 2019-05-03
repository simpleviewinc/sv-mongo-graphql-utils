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

function idResolver(parent, args, context, info) {
	if (parent._id === undefined) { return; }
	
	return parent._id.toString();
}

function mapKeyResolver(key) {
	return function(parent) {
		return parent[key];
	}
}

function removeResultResolver(apiName) {
	return {
		success : function() {
			return true;
		},
		message : function(parent, args, { apis }, info) {
			if (parent.rtn === undefined) {
				throw new Error("removeResultResolver 'message' resolver requires 'rtn' to be returned from primary resolver");
			}
			
			const api = apis[apiName];
			const label = parent.rtn.deletedCount === 1 ? api.label : api.pluralLabel;
			const message = `${parent.rtn.deletedCount} ${label} removed.`;
			
			return message;
		}
	}
}

function successResolver() {
	return function({ success }) {
		return ( success !== undefined ) ? success : true;
	}
}

function toStringResolver(key) {
	return function(parent, args, context, info) {
		if (parent[key] === undefined) { return; }
		
		if (parent[key] instanceof Array) {
			return parent[key].map(val => val.toString());
		} else {
			return parent[key].toString();
		}
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
	idResolver,
	mapKeyResolver,
	removeResultResolver,
	toStringResolver,
	upsertResultResolver,
}