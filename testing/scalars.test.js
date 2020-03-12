const { testArray } = require("@simpleview/mochalib");
const { query } = require("@simpleview/sv-graphql-client");
const assert = require("assert");

const { testId } = require("../src/mongoHelpers");
const TestServer = require("../src/TestServer");

describe(__filename, function() {
	let testServer;

	before(async function() {
		testServer = new TestServer({ port : 10000, path : '/app/testData/graphSchemaComponents/' });
		await testServer.boot();
	});

	after(async function() {
		await testServer.close();
	})

	describe("graphql tests", function() {
		const tests = [
			{
				name : "basic read",
				args : {
					query : `
						query {
							test {
								simple
							}
						}
					`,
					result : {
						test : {
							simple : "query_simple"
						}
					}
				}
			},
			{
				name : "scalar_objectid read",
				args : {
					query : `
						query {
							test {
								objectid
							}
						}
					`,
					result : {
						test : {
							objectid : testId("0").toString()
						}
					}
				}
			},
			{
				name : "scalar_objectid pass in query",
				args : {
					query : `
						query {
							test {
								objectid(id: "${testId("1").toString()}")
							}
						}
					`,
					result : {
						test : {
							objectid : testId("1").toString()
						}
					}
				}
			},
			{
				name : "scalar_objectid pass via variable",
				args : {
					query : `
						query($objectid: test_objectid) {
							test {
								objectid(id: $objectid)
							}
						}
					`,
					variables : {
						objectid : testId("2").toString()
					},
					result : {
						test : {
							objectid : testId("2").toString()
						}
					}
				}
			}
		];

		testArray(tests, async function(test) {
			const result = await query({
				url : "http://localhost:10000/",
				query : test.query,
				variables : test.variables
			});

			assert.deepStrictEqual(result, test.result);
		});
	});
});