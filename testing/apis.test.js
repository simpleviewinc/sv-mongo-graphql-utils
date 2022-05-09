const assert = require("assert");
const {
	apisLoader,
	mongoHelpers,
} = require("../");
const { deepCheck } = require("@simpleview/assertlib");
const { MongoClient } = require("mongodb");
const { testArray } = require("@simpleview/mochalib");

const API = require("../src/apisLoader/Api.js");

const self = this;

describe(__filename, function() {
	describe("Api.js", function(){
		after(async function(){
			//thanks buddy!
			await self.conn.close();
		});

		before(async function() {
			const connectionString = 'mongodb://localhost:27017/';
			const dbName = "apijstest";
			self.conn = await MongoClient.connect(connectionString, { useNewUrlParser : true, useUnifiedTopology: true });
			self.db = self.conn.db(dbName);

			self.basicDef = require('../testData/mongoModels/basic.js')();

			self.basicApi = new API({
				name : 'basic',
				def : self.basicDef,
				db : self.db
			});
		});

		describe("new API()", function(){
			const tests = [
				{
					name : 'should set name',
					args : {
						key : 'name',
						result : 'basic'
					}
				},
				{
					name : 'should set label',
					args : {
						key : 'label',
						result : 'basic'
					}
				},
				{
					name : 'should set pluralLabel',
					args : {
						key : 'pluralLabel',
						result : 'basics'
					}
				},
				{
					name : 'should set _def',
					args : {
						key : '_def',
						method : () => {
							const def = require('../testData/mongoModels/basic.js')();
							return def;
						}
					}
				},
			];

			testArray(tests, function(test){
				const keyValue = self.basicApi[test.key];
				if(test.value !== undefined){
					deepCheck(keyValue, test.result);
				}

				if(test.method !== undefined){
					deepCheck(keyValue, test.method());
				}
			});
		});

		describe("api._convertValidation", function(){
			const tests = [
				{
					name : 'should convert enforceRequired(true)',
					args : {
						enforceRequired : true,
						result : {
							allowExtraKeys: false,
							schema: [
								{
									name: '_id',
									required: false,
									type: 'class'
								},
								{
									name: 'basic',
									required: true,
									type: 'string'
								}
							],
							throwOnInvalid: true,
							type: 'object'
						}
					}
				},
				{
					name : 'should convert enforceRequired(false)',
					args : {
						enforceRequired : false,
						result : {
							allowExtraKeys: false,
							schema: [
								{
									name: '_id',
									required: false,
									type: 'class'
								},
								{
									name: 'basic',
									required: false,
									type: 'string'
								}
							],
							throwOnInvalid: true,
							type: 'object'
						}
					}
				},
			];

			testArray(tests, function(test){
				const validationStruct = self.basicApi._convertValidation(test.enforceRequired);
				deepCheck(validationStruct, test.result);
			});
		});

		describe("api._validate", function(){
			const tests = [
				{
					name : 'should validate with all keys',
					args : {
						enforceRequired : true,
						data : {
							_id : mongoHelpers.testId('foo'),
							basic : 'bar'
						}
					}
				},
				{
					name : 'should validate with missing required key without enforceRequired',
					args : {
						enforceRequired : false,
						data : {
							_id : mongoHelpers.testId('foo'),
						}
					}
				},
				{
					name : 'should not allow extra key',
					args : {
						enforceRequired : false,
						data : {
							_id : mongoHelpers.testId('foo'),
							basic : 'bar',
							bin : 'baz'
						},
						error : "Object contains extra key 'bin' not declared in schema."
					}
				},
				{
					name : 'should not validate with missing required key when enforceRequired',
					args : {
						enforceRequired : true,
						data : {
							_id : mongoHelpers.testId('foo'),
						},
						error : "Required field 'basic' does not exist."
					}
				},
			];

			testArray(tests, function(test){
				try {
					const validationCheck = self.basicApi._validate(test.data, test.enforceRequired);
					deepCheck(validationCheck, undefined);
				}catch(err){
					const errorCheck = new Error("Validation Error\r\n\t" + test.error);
					deepCheck(err.message, errorCheck.message);
				}
			});
		});

		describe("api.init", function(){
			before(async function() {
				await self.basicApi.init();
			});

			const tests = [
				{
					name : 'should find basic collection',
					args : {
						method : async () => {
							const res = await self.db.collections();
							return res;
						},
						result : [
							{
								collectionName : "basic"
							}
						]
					}
				},
				{
					name : 'should find basic indexes',
					args : {
						method : async () => {
							const res = await self.db.indexInformation('basic');
							return res;
						},
						result : {
							_id_ : [
								[ '_id', 1 ]
							],
							_id_1_test_1 : [
								[ '_id', 1 ],
								[ 'test', 1 ]
							]
						}
					}
				},
			];

			testArray(tests, async function(test){
				const res = await test.method();
				deepCheck(res, test.result);
			});
		});

		describe("api.insertOne", function(){
			beforeEach(async function() {
				self.db.collection('basic').deleteMany({});
			});

			const tests = [
				{
					name : 'should insert one',
					args : {
						id: mongoHelpers.testId('1'),
						data : { basic: 'insertOne' },
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'insertOne'
							}
						]
					}
				},
			];

			testArray(tests, async function(test){
				const data = test.data;
				data['_id'] = test.id;
				await self.basicApi.insertOne(data);

				const res = await self.db.collection('basic').find({ _id : test.id }).toArray();
				deepCheck(res, test.result);
			});
		});

		describe("api.insertMany", function(){
			beforeEach(async function() {
				self.db.collection('basic').deleteMany({});
			});

			const tests = [
				{
					name : 'should insert many',
					args : {
						data : [
							{
								_id : mongoHelpers.testId('1'),
								basic: 'insertOne'
							},
							{
								_id : mongoHelpers.testId('2'),
								basic: 'insertTwo'
							},
							{
								_id : mongoHelpers.testId('3'),
								basic: 'insertThree'
							},
							{
								_id : mongoHelpers.testId('4'),
								basic: 'insertFour'
							},
						],
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'insertOne'
							},
							{
								_id : mongoHelpers.testId('2'),
								basic : 'insertTwo'
							},
							{
								_id : mongoHelpers.testId('3'),
								basic : 'insertThree'
							},
							{
								_id : mongoHelpers.testId('4'),
								basic : 'insertFour'
							}
						]
					}
				},
				{
					name : 'should not insert many with invalid data',
					args : {
						data : [
							{
								_id : mongoHelpers.testId('1'),
								basic: 'insertOne'
							},
							{
								_id : mongoHelpers.testId('2'),
							},
							{
								_id : mongoHelpers.testId('3'),
								basic: 'insertThree'
							},
						],
						error : "Required field 'basic' does not exist."
					}
				},
			];

			testArray(tests, async function(test){
				try {
					await self.basicApi.insertMany(test.data);

					const res = await self.db.collection('basic').find({ }).toArray();
					deepCheck(res, test.result);
				}catch(err){
					const errorCheck = new Error("Validation Error\r\n\t" + test.error);
					deepCheck(err.message, errorCheck.message);
				}
			});
		});

		describe("api.updateOne", function(){
			beforeEach(async function() {
				await self.db.collection('basic').deleteMany({});
			});

			after(async function() {
				await self.basicApi.deleteMany({});
			});

			const tests = [
				{
					name : 'should update one $set',
					args : {
						insert : true,
						update : { $set : { basic : 'updated' } },
						filter : { _id : mongoHelpers.testId('1') },
						options : {},
						id : mongoHelpers.testId('1'),
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'updated'
							}
						]
					}
				},
				{
					name : 'should update one $set && $setOnInsert',
					args : {
						insert : true,
						update : {
							$set : { basic : 'updated' },
							$setOnInsert : {  _id : mongoHelpers.testId('1') }
						},
						filter : { _id : mongoHelpers.testId('1') },
						options : {},
						id : mongoHelpers.testId('1'),
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'updated'
							}
						]
					}
				},
				{
					name : 'should not update with only $setOnInsert',
					args : {
						insert : true,
						update : {
							$setOnInsert : {
								_id : mongoHelpers.testId('1'),
								basic : 'updated'
							}
						},
						filter : { _id : mongoHelpers.testId('1') },
						options : {},
						id : mongoHelpers.testId('1'),
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'updateTarget'
							}
						]
					}
				},
				{
					name : 'should update upsert',
					args : {
						insert : false,
						update : {
							$set : { basic : 'upserted' },
							$setOnInsert : {  _id : mongoHelpers.testId('1') }
						},
						filter : { _id : mongoHelpers.testId('1') },
						options : { upsert : true },
						id : mongoHelpers.testId('1'),
						result : [
							{
								_id : mongoHelpers.testId('1'),
								basic : 'upserted'
							}
						]
					}
				},
			];

			testArray(tests, async function(test){
				if(test.insert === true){
					await self.basicApi.insertOne({
						_id : test.id,
						basic : 'updateTarget'
					});
				}

				await self.basicApi.updateOne(test.filter, test.update, test.options);

				const res = await self.db.collection('basic').find({ _id : test.id }).toArray();
				deepCheck(res, test.result);
			});
		});

		describe("backup/restore", function() {
			after(async function() {
				await self.basicApi._backupCollection.drop();
			});

			it("backup and restore", async function() {
				await self.basicApi.insertMany([
					{
						basic : "one"
					},
					{
						basic : "two"
					}
				]);

				await self.basicApi.backup();
				await self.basicApi.deleteMany({});
				const items0 = await self.basicApi.find({}).toArray();
				assert.deepStrictEqual(items0, []);
				const items1 = await self.basicApi._backupCollection.find({}).project({ _id : 0 }).toArray();
				assert.deepStrictEqual(items1, [{ basic : "one" }, { basic : "two" }]);
				await self.basicApi.restore();
				const items2 = await self.basicApi.find({}).project({ _id : 0 }).toArray();
				assert.deepStrictEqual(items2, [{ basic : "one" }, { basic : "two" }]);
			});
		});
	});

	describe("apisLoader", async function(){
		it("should load apis", async function() {
			const connectionString = 'mongodb://localhost:27017/';
			const dbName = 'apisloadertest';
			const modelDirectoryRoot = '/app/testData/mongoModels/'

			const res = await apisLoader({ connectionString, dbName, modelDirectoryRoot });

			const loaderCheck = {
				conn : {},
				apis : {
					basic : {},
					complex : {}
				}
			}

			deepCheck(res, loaderCheck);

			res.conn.close();
		});
	});
});