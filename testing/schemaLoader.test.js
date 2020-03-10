const { schemaLoader } = require("../");
const { 
	gql, 
	makeExecutableSchema 
} = require("apollo-server-express");
const { deepCheck } = require("@simpleview/assertlib");
const { testArray } = require("@simpleview/mochalib");
const lodash = require("lodash");

const API = require("../src/apisLoader/Api.js");

const self = this;

describe(__filename, function() {
	describe("schemaLoader", async function(){
		it("should load schema", async function() {
			const graphqlRootDirectory = '/app/testData/graphSchemaComponents/'

			const res = await schemaLoader({ graphqlRootDirectory });

			const _typeMapCheck = {
				Query : {},
				test_query : {},
				Mutation : {},
				test_mutation : {},
				test_result : {},
				test_objectid : {}
			}

			deepCheck(res._typeMap, _typeMapCheck);
			deepCheck(res._directives.length, 4);
		});
	});
});