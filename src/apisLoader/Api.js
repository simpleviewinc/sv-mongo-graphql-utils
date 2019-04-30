const jsvalidator = require("jsvalidator");
const { ObjectId } = require("mongodb");

const Api = function(args) {
	const self = this;
	
	self.name = args.name;
	self.label = args.def.label;
	self.pluralLabel = args.def.pluralLabel;
	self._def = args.def;
	self._db = args.db;
	
	self._validation = {
		// store validation if we can enforce required fields
		true : self._convertValidation(true),
		// store validation if we cannot enforce required fields
		false : self._convertValidation(false)
	}
	
	self.collection = self._db.collection(self.name);
};

// convert the mongodb schema to a jsvalidator variant
Api.prototype._convertValidation = function(enforceRequired) {
	const self = this;
	
	const validation = {
		type : "object",
		schema : [],
		allowExtraKeys : false,
		throwOnInvalid : true
	}
	
	for(let [name, val] of Object.entries(self._def.schema.properties)) {
		let entry = {
			name,
			required : enforceRequired && self._def.schema.required && self._def.schema.required.includes(name)
		}
		Object.assign(entry, createSchemaEntry(val));
		
		validation.schema.push(entry);
	}
	
	return validation;
}

Api.prototype._validate = function(data, enforceRequired) {
	const self = this;
	
	jsvalidator.validate(data, self._validation[enforceRequired]);
}

Api.prototype.init = async function() {
	const self = this;
	
	// create collection
	await self._db.createCollection(self.name);
	
	// apply validation
	await self._db.command({
		collMod : self.name,
		validator : {
			$jsonSchema : self._def.schema
		},
		validationLevel : "strict",
		validationAction : "error"
	});

	// create indexes
	if (self._def.indexes !== undefined) {
		for(let index of self._def.indexes) {
			await self.collection.createIndex(index.keys, index.options)
		}
	}
};

// wrap updateOne to provide validation
Api.prototype.updateOne = function(filter, update, options) {
	const self = this;
	
	if (update.$set !== undefined && update.$setOnInsert !== undefined) {
		// if we have a $set and a $setOnInsert we can merge them together and enforce required keys and types
		const merged = Object.assign({}, update.$set, update.$setOnInsert);
		self._validate(merged, true);
	} else if (update.$set === undefined && update.$setOnInsert !== undefined) {
		// no set, only a $setOnInsert, so lets validate it for required fields
		self._validate(update.$setOnInsert, true);
	} else if (update.$set !== undefined && update.$setOnInsert === undefined) {
		// if we only have a $set we have to assume the record is already valid in the DB, so we cannot enforce required
		// thus we can only validate the types of the fields being passed in $set
		self._validate(update.$set, false);
	}
	
	if (update.$unset !== undefined) {
		for(let key in update.$unset) {
			if (self._def.schema.required.includes(key)) {
				throw new Error(`Unable to $unset required key '${key}'`);
			}
		}
	}
	
	return self.collection.updateOne(filter, update, options);
}

// wrap insertOne to provide validation
Api.prototype.insertOne = function(data) {
	const self = this;
	
	self._validate(data, true);
	
	return self.collection.insertOne(data);
}

// wrap insertMany to provide validation
Api.prototype.insertMany = function(data) {
	const self = this;
	
	for(let val of data) {
		self._validate(val, true);
	}
	
	return self.collection.insertMany(data);
}

const methods = [
	"find",
	"findOne",
	"countDocuments",
	"distinct",
	"deleteOne",
	"deleteMany",
	"updateMany"
];
methods.forEach(function(val, i) {
	Api.prototype[val] = function(...args) {
		var self = this;
		return self.collection[val](...args);
	}
});

function createSchemaEntry(obj) {
	let temp;
	
	switch (obj.bsonType) {
		case "objectId":
			return { type : "class", class : ObjectId };
		case "string":
			temp = { type : "string" };
			if (obj.enum !== undefined) {
				temp.enum = obj.enum;
			}
			
			return temp;
		case "int":
			return { type : "number" };
		case "date":
			return { type : "date" };
		case "array":
			temp = { type : "array" };
			temp.schema = createSchemaEntry(obj.items);
			return temp;
		case "object":
			return { type : "object" };
		case "bool":
			return { type : "boolean" };
		default:
			throw new Error(`Unmapped bsonType '${obj.bsonType}'`);
	}
}

module.exports = Api;