# sv-mongo-graphql-utils
# API
## apisLoader
Connects to mongodb and loads a folder of model files allowing them to be queried via a simple mongo wrapper.

* args
  * connectionString - a string used to connect to a mongo database server
  * dbName - name of the database the apis will be used on
  * modelDirectoryRoot - folder containing one or more models to be used in the DB

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
  context: ({ req }) => {
    return {
      apis
    };
  }
});
```
  
## schemaLoader

Processes a folder of schema files and returns them for use in an apollo server.

* args
  * graphqlRootDirectory - folder containing graphql schema components (resolvers, types, directives, scalars, etc.)

```js
const { schemaLoader } = require("@simpleview/sv-mongo-graphql-utils");

const schema = await schemaLoader({ graphqlRootDirectory : '/app/lib/graphql' });

const server = new ApolloServer({
  schema,
  ...
});
```

## mongoHelpers

Utility methods to make it easier to work with MongoDB from GraphQL.

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

# Development

* Enter dev environment - `sudo npm run docker`
* Test - (from within the dev environment) `npm test`
* Publish - `sudo npm run publish SEMVER`