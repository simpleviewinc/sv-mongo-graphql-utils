const { mongoHelpers } = require("../");
const assert = require("assert");
const mochaLib = require("@simpleview/mochalib");

describe(__filename, function() {
	describe("MongoHelpers", () => {
		const tests = [
			{
				name : 'should make a testId',
				args : {
					method : mongoHelpers.testId("1").toString(),
					result : "000000000000000000000031"
				}
			},
			{
				name : 'should create an empty filter',
				args : {
					method : mongoHelpers.createFilter({ }),
					result : { }
				}
			},
			{
				name : 'should create a filter',
				args : {
					method : mongoHelpers.createFilter({
						id : '000000000000000000000031',
						foo : 'bar',
						bin : true,
						obj : {
							foo : 'bar',
							bin : 1,
							baz : false
						}
					}),
					result : { 
						_id : '000000000000000000000031',  
						foo : 'bar',
						bin : true,
						obj : {
							foo : 'bar',
							bin : 1,
							baz : false
						}
					}
				}
			},
			{
				name : 'should create an empty options struct',
				args : {
					method : mongoHelpers.createOptions({ }),
					result : { }
				}
			},
			{
				name : 'should create an options struct with only a limit',
				args : {
					method : mongoHelpers.createOptions({
						limit : 10
					}),
					result : { 
						limit : 10
					}
				}
			},
			{
				name : 'should create an options struct with only a skip',
				args : {
					method : mongoHelpers.createOptions({
						skip : 10
					}),
					result : { 
						skip : 10
					}
				}
			},
			{
				name : 'should create an options struct with only a sort',
				args : {
					method : mongoHelpers.createOptions({
						sort : [
							{field : "foo", dir: "asc"}, 
							{field : "bar", dir: "desc"}
						]
					}),
					result : { 
						sort : {
							foo : 1,
							bar : -1
						}
					}
				}
			},
			{
				name : 'should create a full options struct',
				args : {
					method : mongoHelpers.createOptions({
						limit : 10,
						skip : 10,
						sort : [
							{field : "foo", dir: "asc"}, 
							{field : "bar", dir: "desc"}
						]
					}),
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
		];

		mochaLib.testArray(tests, function(test) {
			assert.deepStrictEqual(test.method, test.result);
		});
	});
});