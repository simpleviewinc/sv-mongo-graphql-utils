const assert = require("assert");
const { deepCheck } = require("@simpleview/assertlib");
const { testArray } = require("@simpleview/mochalib");

const { mongoHelpers } = require("../");

describe(__filename, function() {
	describe("createFilter", function() {
		const tests = [
			{
				name : "should create a basic filter",
				args : {
					data : {
						id : '000000000000000000000031',
						foo : 'bar',
						bin : true,
						obj : {
							foo : 'bar',
							bin : 1,
							baz : false
						},
						undefined_key : undefined
					},
					result : { 
						_id : '000000000000000000000031',
						foo : 'bar',
						bin : true,
						obj : {
							foo : 'bar',
							bin : 1,
							baz : false
						},
						undefined_key : undefined
					}
				}
			},
			{
				name : "should create a filter with a WHERE clause",
				args : {
					data : {
						foo : 'bar',
						WHERE : {
							foo : { exists : true }
						}
					},
					result : { 
						foo : 'bar',
						'$and' : [
							{ foo : { '$exists' : true } }
						]
					}
				}
			},
			{
				name : "should create a filter with an AND clause",
				args : {
					data : {
						foo : 'bar',
						AND : [
							{ bin : { $ne : 'baz' } },
							{ beer : { $exists : true } }
						]
					},
					result : { 
						foo : 'bar',
						$and : [
							{ bin : { $ne : 'baz' } },
							{ beer : { $exists : true } }
						]
					}
				}
			},
			{
				name : "should handle $and and AND",
				args : {
					data : {
						foo : "fooValue",
						$and : [
							{ foo : "foo2" }
						],
						AND : [
							{ foo : "simpleKey" },
							{ WHERE : { foo : { exists : true } } }
						]
					},
					result : {
						foo : "fooValue",
						$and : [
							{ foo : "foo2" },
							{ foo : "simpleKey" },
							{ $and : [{ foo : { $exists : true } }] }
						]
					}
				}
			},
			{
				name : "should create a filter with an OR clause",
				args : {
					data : {
						foo : 'bar',
						OR :[
							{ bin : 'baz' }
						]
					},
					result : { 
						foo : 'bar',
						'$or' : [
							{ bin : 'baz' },
						]
					}
				}
			},
			{
				name : "should handle $or and OR",
				args : {
					data : {
						foo : "fooValue",
						$or : [
							{ foo : "foo2" }
						],
						OR : [
							{ foo : "simpleKey" },
							{ WHERE : { foo : { exists : true } } }
						]
					},
					result : {
						foo : "fooValue",
						$or : [
							{ foo : "foo2" },
							{ foo : "simpleKey" },
							{ $and : [{ foo : { $exists : true } }] }
						]
					}
				}
			}
		];
		
		testArray(tests, function(test) {
			const res = mongoHelpers.createFilter(test.data);
			deepCheck(res, test.result);
		});
	});

	describe("createOptions", function() {
		const tests = [
			{
				name : "should create an empty options struct",
				args : {
					data : { },
					result : { }
				}
			},
			{
				name : "should create an options struct with only a limit",
				args : {
					data : { limit : 10 },
					result : { limit : 10 }
				}
			},
			{
				name : 'should create an options struct with only a skip',
				args : {
					data : { skip : 10 },
					result : { skip : 10 }
				}
			},
			{
				name : 'should create an options struct with only a sort',
				args : {
					data : { 
						sort : [
							{field : "foo", dir: "asc"}, 
							{field : "bar", dir: "desc"}
						]
					},
					result : { 
						sort : {
							foo : 1,
							bar : -1
						}
					}
				}
			},
			{
				name : 'should create full options struct',
				args : {
					data : { 
						limit : 10,
						skip : 10,
						sort : [
							{field : "foo", dir: "asc"}, 
							{field : "bar", dir: "desc"}
						]
					},
					result : { 
						limit : 10,
						skip : 10,
						sort : {
							foo : 1,
							bar : -1
						}
					}
				}
			},
			{
				name : 'should error without sort direction',
				args : {
					data : { 
						sort : [
							{field : "foo"}, 
						]
					},
					errorMessage : "foo sort direction must be defined"
				}
			},
			{
				name : 'should error without sort key',
				args : {
					data : { 
						sort : [
							{dir: "asc"}, 
						]
					},
					errorMessage : "sort field 0 must be defined"
				}
			},
		];
		
		testArray(tests, function(test) {
			try {
				const res = mongoHelpers.createOptions(test.data);
				deepCheck(res, test.result);
			}catch(err){
				deepCheck(err.message, test.errorMessage);
			}
		});
	});

	describe("setUnsetKey", function() {
		const tests = [
			{
				name : "Should $set test",
				args : {
					data : {
						options : {},
						key : "test",
						value : "test"
					},
					result : { '$set': { test: 'test' } }
				}
			},
			{
				name : "Should $unset test",
				args : {
					data : {
						options : {},
						key : "test",
						value : undefined
					},
					result : { '$unset': { test: '' } }
				}
			},
		];
		
		testArray(tests, function(test) {
			mongoHelpers.setUnsetKey(test.data);
			deepCheck(test.data.options, test.result);
		});
	});

	describe("testId", function() {
		const tests = [
			{
				name : "Should make a testId",
				args : {
					data : "1",
					result : "000000000000000000000031"
				}
			},
			{
				name : "Should not make a testId from a non-string",
				args : {
					data : 1,
					errorMessage : "str must be a string"
				}
			},
			{
				name : "Should not make a testId from an undefined str",
				args : {
					data : undefined,
					errorMessage : "str must be a string"
				}
			},
		];
		
		testArray(tests, function(test) {
			try {
				const res = mongoHelpers.testId(test.data).toString();
				deepCheck(res, test.result);
			}catch(err){
				deepCheck(err.message, test.errorMessage);
			}
		});
	});

	describe("pickDefined", function() {
		const tests = [
			{
				name : "should pick defined keys",
				args : {
					obj : { foo : true, bar : "barValue", baz : 10 },
					keys : ["foo", "bar", "baz"],
					result : { foo : true, bar : "barValue", baz : 10 }
				}
			},
			{
				name : "should ignore undefined",
				args : {
					obj : { foo : true, bar : undefined, baz : null },
					keys : ["foo", "bar", "baz"],
					result : { foo : true, baz : null }
				}
			},
			{
				name : "should not pick undeclared keys",
				args : {
					obj : { foo : true, bar : "something" },
					keys : ["foo", "bogus"],
					result : { foo : true }
				}
			}
		];

		testArray(tests, function(test) {
			const result = mongoHelpers.pickDefined(test.obj, test.keys);
			assert.deepStrictEqual(result, test.result);
		});
	});
});