const { makeExecutableSchema } = require("apollo-server-express");
const { readdirRegex } = require("../utils");
const lodash = require("lodash");

module.exports = async function({ graphqlRootDirectory }) {
	const typeDefs = [];
	const resolvers = [{}];
	const schemaDirectives = {};
	
	const dirResult = await readdirRegex(graphqlRootDirectory, /\.js$/);

	for(let name of dirResult) {
		const temp = require(`${graphqlRootDirectory}/${name}`);
		
		if (temp.typeDefs !== undefined) {
			typeDefs.push(temp.typeDefs);
		}
		
		if (temp.resolvers !== undefined) {
			resolvers.push(temp.resolvers);
		}
		
		if (temp.schemaDirectives !== undefined) {
			Object.assign(schemaDirectives, temp.schemaDirectives);
		}
	}

	const schema = makeExecutableSchema({
		typeDefs,
		resolvers : lodash.merge(...resolvers),
		schemaDirectives
	});
	
	return schema;
}