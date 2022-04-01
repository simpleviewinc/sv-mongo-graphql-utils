const { schemaLoader } = require("@simpleview/sv-graphql-client");
const { ApolloServer } = require("apollo-server-express");

const express = require("express");
const util = require("util");

class TestServer {
	/**
	 * @param {Object} args
	 * @param {number} args.port - The number to access your test server on http://localhost:port/
	 * @param {string} args.path - The filepath to where your schema files are located
	 */
	constructor({ port, path }) {
		this.port = port;
		this.path = path;
		this.httpServer = undefined;
	}
	/**
	 * Start the express server, close it via close()
	 */
	async boot() {
		const app = express();
		app.get("/status/", function(req, res) {
			res.json({ start : Date.now() });
		});

		const server = new ApolloServer({
			schema : await schemaLoader({ paths : [this.path] })
		});

		await server.start();

		server.applyMiddleware({
			app,
			path : "/"
		});

		return new Promise((resolve, reject) => {
			const expressServer = app.listen(this.port, function(err) {
				if (err) { return reject(err); }

				resolve();
			});

			this.httpServer = expressServer;
		});
	}
	/**
	 * Close the express server
	 */
	async close() {
		const close = util.promisify(this.httpServer.close).bind(this.httpServer);
		return close();
	}
}

module.exports = TestServer;