const { deepCheck } = require("@simpleview/assertlib");
const { testArray } = require("@simpleview/mochalib");

const { 
	apisLoader, 
	graphqlHelpers,
	mongoHelpers 
} = require("../");

const self = this;

describe(__filename, function() {
	before(async function(){
		const connectionString = 'mongodb://localhost:27017/';
		const dbName = 'graphqlhelperstest';
		const modelDirectoryRoot = '/app/testData/mongoModels/'

		const basicLoader = await apisLoader({ connectionString, dbName, modelDirectoryRoot });
		self.apis = basicLoader.apis;
		self.conn = basicLoader.conn;
	});
	
	after(async function(){
		await self.conn.close();
	});

	describe("findResultResolver()", function() {
		before(async function(){
			const apiName = 'basic';
			self.findResultResolver = graphqlHelpers.findResultResolver(apiName);

			await self.apis['basic'].deleteMany({});
			await self.apis['basic'].insertMany([
				{ _id : mongoHelpers.testId('1'), basic: 'one' },
				{ _id : mongoHelpers.testId('2'), basic: 'two' },
				{ _id : mongoHelpers.testId('3'), basic: 'three' }
			]);
		});

		describe("docs()", function() {
			const tests = [
				{
					name : "should return all docs with no filter/options",
					args : {
						filter : {},
						options : {},
						result : [
							{ _id : mongoHelpers.testId('1'), basic: 'one' },
							{ _id : mongoHelpers.testId('2'), basic: 'two' },
							{ _id : mongoHelpers.testId('3'), basic: 'three' }
						]
					}
				},
				{
					name : "should return specifc doc when filter is specified",
					args : {
						filter : { _id : mongoHelpers.testId('1') },
						options : {},
						result : [
							{ _id : mongoHelpers.testId('1'), basic: 'one' }
						]
					}
				},
				{
					name : "should limited docs when options specified",
					args : {
						filter : {},
						options : { limit : 2 },
						result : [
							{ _id : mongoHelpers.testId('1'), basic: 'one' },
							{ _id : mongoHelpers.testId('2'), basic: 'two' }
						]
					}
				},
			];
			
			testArray(tests, async function(test) {
				const res = await self.findResultResolver.docs({ filter : test.filter, options : test.options }, {}, { apis : self.apis }, {});
				deepCheck(res, test.result);
			});
		});

		describe("count()", function() {
			const tests = [
				{
					name : "should return total number of docs with no filter",
					args : {
						filter : {},
						result : 3
					}
				},
				{
					name : "should return sub-count when filter is specified",
					args : {
						filter : { _id : mongoHelpers.testId('1') },
						result : 1
					}
				},
			];
			
			testArray(tests, async function(test) {
				const res = await self.findResultResolver.count({ filter : test.filter }, {}, { apis : self.apis }, {});
				deepCheck(res, test.result);
			});
		});
	});

	describe("idResolver()", function() {
		const tests = [
			{
				name : "should resolve id",
				args : {
					parent : {
						_id : mongoHelpers.testId('1')
					},
					result : mongoHelpers.testId('1').toString()
				}
			},
			{
				name : "should return undefined with no parent._id",
				args : {
					parent : { },
					result : undefined
				}
			},
		];
		
		testArray(tests, function(test) {
			const res = graphqlHelpers.idResolver(test.parent, {}, {}, {});
			deepCheck(res, test.result);
		});
	});

	it("should mapKeyResolver()", function(){
		const key = 'test';
		const parent = {
			test : 'testData'
		}
		const expectedReturn = 'testData';
		const func = graphqlHelpers.mapKeyResolver(key);
		const res = func(parent);
		
		deepCheck(res, expectedReturn);
	});

	describe("removeResultResolver()", function() {
		before(function(){
			const apiName = 'basic';
			self.removeResultResolver = graphqlHelpers.removeResultResolver(apiName);
		});

		describe("success()", function() {
			it("should only return true", function(){
				const success = false;
				const res = self.removeResultResolver.success({success});
				deepCheck(res, true);
			});
		});

		describe("message()", function() {
			const tests = [
				{
					name : "should show singular delete message",
					args : {
						parent : {
							rtn : {
								deletedCount : 1
							}
						},
						result : "1 basic removed."
					}
				},
				{
					name : "should show plural delete message",
					args : {
						parent : {
							rtn : {
								deletedCount : 3
							}
						},
						result : "3 basics removed."
					}
				},
				{
					name : "should error if rtn is missing",
					args : {
						parent : { },
						error : new Error("removeResultResolver 'message' resolver requires 'rtn' to be returned from primary resolver")
					}
				},
			];
			
			testArray(tests, function(test) {
				try {
					const res = self.removeResultResolver.message(test.parent, {}, { apis : self.apis }, {});
					deepCheck(res, test.result);
				}catch(err){
					deepCheck(err.message, test.error.message);
				}
			});
		});
	});

	describe("toStringResolver()", function() {
			const tests = [
				{
					name : "Should convert int to string",
					args : {
						parent : {
							testkey : 1
						},
						result : "1"
					}
				},
				{
					name : "Should convert array of ints to array of strings",
					args : {
						parent : {
							testkey : [
								1,
								2,
								3
							]
						},
						result : [
							"1",
							"2",
							"3"
						]
					}
				},
				{
					name : "Should return undefined if no key defined",
					args : {
						parent : {},
						result : undefined
					}
				},
			];
			
			testArray(tests, function(test) {
				const func = graphqlHelpers.toStringResolver('testkey');
				const res = func(test.parent, {}, {}, {})
				deepCheck(res, test.result);
			});
		});

	describe("upsertResultResolver()", function() {
		before(function(){
			const apiName = 'basic';
			self.upsertResultResolver = graphqlHelpers.upsertResultResolver(apiName);
		});

		describe("success()", function() {
			it("should return manual value", function(){
				const success = false;
				const res = self.upsertResultResolver.success({success});
				deepCheck(res, false);
			});

			it("should return with no value specified", function(){
				const res = self.upsertResultResolver.success({});
				deepCheck(res, true);
			});
		});

		describe("message()", function() {
			const tests = [
				{
					name : "Should return manual message",
					args : {
						parent : {
							message : 'test message.',
							rtn : {
								upsertedCount : 0
							}
						},
						result : "test message."
					}
				},
				{
					name : "Should return updated message",
					args : {
						parent : {
							message : '',
							rtn : {
								upsertedCount : 0
							}
						},
						result : "basic updated."
					}
				},
				{
					name : "Should return created message",
					args : {
						parent : {
							message : '',
							rtn : {
								upsertedCount : 1
							}
						},
						result : "basic created."
					}
				},
				{
					name : "Should error with missing rtn",
					args : {
						parent : {
							message : '',
						},
						error : new Error("upsertResultResolver 'message' resolver requires 'rtn' to be returned from primary resolver")
					}
				},
			];
			
			testArray(tests, function(test) {
				try {
					const res = self.upsertResultResolver.message(test.parent, {}, { apis : self.apis }, {});
					deepCheck(res, test.result);
				}catch(err){
					deepCheck(err.message, test.error.message);
				}
			});
		});

		describe("doc()", function() {
			beforeEach(async function(){
				await self.apis['basic'].deleteMany({});
				await self.apis['basic'].insertOne({ _id : mongoHelpers.testId('1'), basic: 'insertOne' });
			});

			const tests = [
				{
					name : "Should return empty object with no success",
					args : {
						parent : {
							success : false,
							filter : {}
						},
						args : {},
						info : {},
						result : null
					}
				},
				{
					name : "Should return a doc with success",
					args : {
						parent : {
							success : true,
							filter : { _id : mongoHelpers.testId('1') }
						},
						args : {},
						info : {},
						result : { 
							_id : mongoHelpers.testId('1'), 
							basic: 'insertOne' 
						}
					}
				},
				{
					name : "Should error with missing filter",
					args : {
						parent : {
							success : true,
						},
						args : {},
						info : {},
						error : new Error("upsertResultResolver 'doc' resolver requires 'filter' to be returned from primary resolver")
					}
				},
			];
			
			testArray(tests, async function(test) {
				try {
					const res = await self.upsertResultResolver.doc(test.parent, test.args, { apis : self.apis }, test.info);
					deepCheck(res, test.result);
				}catch(err){
					deepCheck(err.message, test.error.message);
				}
			});
		});
	});
});