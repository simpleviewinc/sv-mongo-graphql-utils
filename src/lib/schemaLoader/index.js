const { makeExecutableSchema } = require("apollo-server-express");
const fs = require("fs");
const util = require("util");
const lodash = require("lodash");

const readdirP = util.promisify(fs.readdir);

module.exports = async function({ graphqlRootDirectory }) {
	const typeDefs = [];
	const resolvers = [{}];
	const schemaDirectives = {};
	
	const dirResult = await readdirP(graphqlRootDirectory);
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