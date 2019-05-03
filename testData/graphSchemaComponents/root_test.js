const { gql } = require("apollo-server-express");

const typeDefs = gql`
	directive @test_directive(
		message: String = "testing"
	) on FIELD_DEFINITION

	extend type Query {
		test : test_query
	}
	
	type test_query
	
	extend type Mutation {
		test : test_mutation
	}
	
	type test_mutation

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
	}
};

module.exports = {
	typeDefs,
	resolvers
}