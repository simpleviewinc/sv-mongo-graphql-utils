const gql = require("graphql-tag");

const typeDefs = gql`
	type Query
	type Mutation
`;

const resolvers = {};

module.exports = {
	typeDefs,
	resolvers
}