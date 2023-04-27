# sv-mongo-graphql-utils
# API
## apisLoader
Connects to mongodb and loads a folder of model files allowing them to be queried via a simple mongo wrapper.

* args
  * connectionString - a string used to connect to a mongo database server
  * dbName - name of the database the apis will be used on
  * modelDirectoryRoot - folder containing one or more models to be used in the DB
  * setupCollections - default true - If true, then when connecting it will update index definitions, and schema validation for each declared Model. Pass false in cases where you don't need this, such as in unit tests or if multiple containers utilize the same Model files, to speed connection times.

* Returns `Promise` which resolves to
  * apis - Object with a key for each model.
  * conn - Return from `mongodb` `MongoClient.connect`.

```js
const { apisLoader } = require("@simpleview/sv-mongo-graphql-utils");

const { apis, conn } = await apisLoader({
  connectionString : process.env.MONGODB_URL,
  dbName : 'test',
  modelDirectoryRoot : '/app/lib/models'
});

const server = new ApolloServer({
  ...
});

await startStandaloneServer(server, {
  context: ({ req }) => {
    return {
      apis
    };
  }
});
```
### Model files
Model files use mongo's [$jsonSchema](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#json-schema)

Model file example:
```js
module.exports = function() {
	return {
		label : 'modelName',
		pluralLabel : 'modelNamePlural',
		schema : {
			bsonType : 'object',
			required : ['name', 'date'],
			additionalProperties : false,
			properties : {
				_id : {
					bsonType : 'objectId'
				},
				name : {
					bsonType : 'string'
				},
				date : {
					bsonType : 'date'
				},
				related_id : {
					bsonType : 'objectId'
				},
				related_ids : {
					bsonType : 'array',
					items : {
						bsonType : 'objectId'
					},
					uniqueItems : true
				}
			}
		},
		indexes : [
			{
				keys : {
					name : 1
				}
			}
		]
	};
}
```

## scalarObjectId
A returnable scalar which converts a hex string to an object and back utilizing mongo [objectId](https://docs.mongodb.com/manual/reference/method/ObjectId/) 

* args
  * name - application prefixed scalar name

```js
const { scalarObjectId } = require("@simpleview/sv-mongo-graphql-utils");

const typedef = {
  scalar : prefixNameScalar
}

const resolvers = {
  prefixNameScalar: scalarObjectId("prefixNameScalar")
}

```

## mongoHelpers

Utility methods to make it easier to work with MongoDB from GraphQL.

This repo now uses `peerDependencies` with `mongodb` version ^5.0.0. To utilize please ensure that you have a current version of `mongodb` installed in your application.

### createFilter

Builds a mongo filter from a graphql filter object. Supports `WHERE`, `AND`, and `OR` as well as most mongodb operators.

* The key `id` will be converted to `_id`.
* If a key is called `WHERE` is passed, it will process every key it contains into a mongo operator.
  * Example `WHERE : { foo : { exists : true } }` becomes `{ foo : { $exists : true } }`.
  * Example `WHERE : { foo : { gt : 5 } }` becomes `{ foo : { $gt : 5 } }`.
* If a key called `AND` is passed, it will convert the contents into an `$and` array.
  * Example `AND : [{ foo : "someValue" }, { number : 5 }]` becomes `$and : [{ foo : "someValue" }, { number : 5 }]`
* If a key called `OR` is passed, it will convert the contents into an `$or` array.
* You can nest `WHERE` within `AND` and `OR` or vice versa.

In order to best utilize this function your GraphQL schema should add entries for `WHERE`, `AND` and `OR`. You will want to explicitly choose the keys exposed via `WHERE` and their types (string, number). The `AND` and `OR` should likely be a recursive reference.

* args - an object containing a series of graphql filter keys and their values

* Returns new object with a valid Mongodb filter.

```js
const { mongoHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  ...
	test_query : {
		tests : function(parent, { filter = {}, options }, { user }, info) {
			...
			return {
				success,
				message,
				filter : mongoHelpers.createFilter(filter)
			};
		}
	},
}
```

### createOptions
Builds a mongo options object from a graphql options object.

* args - an object containing a series of graphql filter keys and their values
  * limit - limit on the number of items to return from mongo
  * skip - number of items in the set to skip
  * sort - an array of sort objects including the name of the field and a direction `asc` or `desc` e.g. [{field : 'fieldName', dir : 'asc'}]

```js
const { mongoHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  ...
	test_query : {
		tests : function(parent, { filter = {}, options }, { user }, info) {
			...
			return {
				success,
				message,
				options : mongoHelpers.createOptions(options)
			};
		}
	},
}
```

### pickDefined
Returns an object based on the keys specified which are not-undefined. Useful when creating filters are passing keys on to mongo for filtering.

* obj - Object to start with.
* keys - `string[]` keys to pick.

```js
const { mongoHelpers : { pickDefined } } = require("@simpleview/sv-mongo-graphql-utils");
const result = pickDefined({ foo : "fooValue", bar : true, baz : undefined }, ["foo", "baz", "qux"]);
assert.strictEqual(result, { foo : "fooValue" });
```

### testId
Builds a MongoDB ObjectID from a string. Commonly used to build unit test data so you can achieve predictable, but valid, mongodb ObjectIDs.

* args - a string to build the ObjectID from

```js
const { mongoHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const docID = mongoHelpers.testId("1");
```

## graphqlHelpers

Utility methods to make it easier to work with GraphQL.

### findResultResolver

In order to use findResultResolver your primary resolver should return `{ filter, options }` where both keys are valid mongodb filter and options.

This will cause the result to return `{ docs : [], count : Int }` and this should match your GraphQL schema declaration.

* args - name of the api storing the results

```js
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test_tests_result : graphqlHelpers.findResultResolver("tests"),
}
```

### mapKeyResolver

Maps one key to another

* args - name of the key as it is coming into the resolver

```js
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test : {
    id : graphqlHelpers.mapKeyResolver("_id")
  }
  ...
}
```

### upsertResultResolver

In order to use upsertResultResolver your primary resolver should return `{ filter, rtn }` the `rtn` is the result of the `updateOne`. The `filter` should be a valid mongodb filter to be used if the user requests the doc back in their upsert.

This will cause the result to return `{ success, message, doc }`.

* args - name of the api storing the results

```js
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test_tests_upsert_result : graphqlHelpers.upsertResultResolver("tests"),
}
```

### removeResultResolver

In order to use removeResultResolver your primary resolver should return `{ rtn }`. The `rtn` should be the result of the `deleteMany` call.

This will cause the result to return `{ success, message }`.

## readdirRegex

Returns all files in a folder that match a regex.

```js
const { readdirRegex } = require("@simpleview/sv-mongo-graphql-utils");
const content = await utils.readdirRegex("/path/to/folder", /.js$/);
```

# Development

* Enter dev environment - `sudo npm run docker`
* Test - (from within the dev environment) `npm test`
* Publish - `sudo npm run publish SEMVER`
