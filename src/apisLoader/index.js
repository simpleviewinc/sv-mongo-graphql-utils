const { MongoClient } = require("mongodb");
const { readdirRegex } = require("../utils");

const Api = require("./Api");

module.exports = async function({ connectionString, dbName, modelDirectoryRoot, setupCollections = true }) {
	const conn = await MongoClient.connect(connectionString, { useNewUrlParser : true, useUnifiedTopology: true });
	const db = conn.db(dbName);
	
	const apis = {};
	const dirResult = await readdirRegex(modelDirectoryRoot, /\.js$/);
	
	for(let file of dirResult) {
		let name = file.replace(/\.js$/, "");
		let def = require(`${modelDirectoryRoot}/${name}`)();
		let api = new Api({
			name,
			def,
			db
		});

		if (setupCollections === true) {
			// only init if we need to
			await api.init();
		}
		
		apis[name] = api;
	}
	
	return {
		conn,
		apis
	}
}