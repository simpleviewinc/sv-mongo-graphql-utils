const { GraphQLScalarType } = require("graphql");
const { ObjectId } = require("mongodb");

/**
 * Returns an scalar which converts a hex string to an object and back
 * @param {string} name
 */
module.exports = function scalarObjectId(name){
	return new GraphQLScalarType({
		name,
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