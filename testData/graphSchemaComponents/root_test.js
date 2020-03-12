const { gql } = require("apollo-server-express");
const { ObjectId } = require("mongodb");
const assert = require("assert");
const { testId } = require("../../src/mongoHelpers");

const { 
	scalarObjectId
} = require("../../");

const typeDefs = gql`
	scalar test_objectid

	directive @test_directive(
		message: String = "testing"
	) on FIELD_DEFINITION

	extend type Query {
		test : test_query
	}
	
	type test_query {
		simple: String
		objectid(id: test_objectid): test_objectid
	}
	
	extend type Mutation {
		test : test_mutation
	}
	
	type test_mutation {
		simple: String
	}

	type test_result {
		message : String @test_directive(message: "testing")
	}
`;

const resolvers = {
	Query : {
		async test(parent, { acct_id }, context, info) {
			return {};
		}
	},
	Mutation : {
		async test(parent, { acct_id }, context, info) {
			return {};
		}
	},
	test_query : {
		simple : function() {
			return "query_simple";
		},
		objectid : function(parent, { id }) {
			if (id) {
				assert.strictEqual(id instanceof ObjectId, true);
				return id;
			} else {
				return testId("0")
			}
		}
	},
	test_mutation : {
		simple : function() {
			return "mutation_simple"
		}
	},
	test_objectid : scalarObjectId("test_objectid")
};

module.exports = {
	typeDefs,
	resolvers
}