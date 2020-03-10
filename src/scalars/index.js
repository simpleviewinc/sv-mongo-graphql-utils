const { GraphQLScalarType } = require("graphql");
const { ObjectId } = require("mongodb");


function objectid_scalar(prefix){
	return new GraphQLScalarType({
		name : `${prefix}_objectid`,
		description : "Conversion of string to Mongo ObjectId",
		serialize(value) {
			return value.toString();
		},
		parseValue(value) {
			return ObjectId(value);
		},
		parseLiteral(ast) {
			if (ast.kind === "StringValue") {
				return ObjectId(ast.value);
			}
		}
	});
}

module.exports = {
	objectid_scalar
}