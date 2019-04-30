const { MongoClient } = require("mongodb");
const fs = require("fs");
const util = require("util");
const Api = require("./Api");
const readdirP = util.promisify(fs.readdir);

module.exports = async function({ connectionString, dbName, modelDirectoryRoot }) {
	const conn = await MongoClient.connect(connectionString, { useNewUrlParser : true });
	const db = conn.db(dbName);
	
	const apis = {};
	const dirResult = await readdirP(modelDirectoryRoot);
	
	for(let file of dirResult) {
		let name = file.replace(/\.js$/, "");
		let def = require(`${modelDirectoryRoot}/${name}`)();
		let api = new Api({
			name,
			def,
			db
		});

		await api.init();
		
		apis[name] = api;
	}
	
	return {
		conn,
		apis
	}
}