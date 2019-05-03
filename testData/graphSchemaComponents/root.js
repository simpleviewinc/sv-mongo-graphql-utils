const { gql } = require("apollo-server-express");

const typeDefs = gql`
	type Query
	type Mutation
`;

const resolvers = {};

module.exports = {
	typeDefs,
	resolvers
}