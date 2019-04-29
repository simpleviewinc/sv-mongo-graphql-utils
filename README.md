# sv-mongo-graphql-utils
## Components
### Mongo APIs Loader
Returns an object containing api interfaces for mongo.

* args
  * connectionString - a string used to connect to a mongo database server
  * dbName - name of the database the apis will be used on
  * modelDirectoryRoot - folder containing one or more models to be used in the DB

```
const { apisLoader } = require("@simpleview/sv-mongo-graphql-utils");

const apis = await apisLoader({ 
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
  
### GraphQL Schema Loader
Returns a schema for use in apollo server

* args
  * graphqlRootDirectory - folder containing graphql schema components (resolvers, types, directives, scalars, etc.)

```
const { schemaLoader } = require("@simpleview/sv-mongo-graphql-utils");

const schema = await schemaLoader({ graphqlRootDirectory : '/app/lib/graphql' });

const server = new ApolloServer({
  schema,
  ...
});
```

### Mongo Helpers
#### createFilter
Builds a mongo filter from a graphql filter object.

* args
  * filter - an object containing a series of graphql filter keys and their values
note: The key id will be converted to \_id

```
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

#### createOptions
Builds a mongo options object from a graphql options object.

* args
  * options - an object containing a series of graphql filter keys and their values
    * limit - limit on the number of items to return from mongo
    * skip - number of items in the set to skip
    * sort - an array of sort objects including the name of the field and a direction `asc` or `desc` e.g. [{field : 'fieldName', dir : 'asc'}]

```
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

#### testId
Builds a MongoDB ObjectID from a string. Commonly used to build unit test data.

* args
  * str - a string to build the Object from
 ```
 const { mongoHelpers } = require("@simpleview/sv-mongo-graphql-utils");
 const docID = mongoHelpers.testId("1");
 ```
### GraphQL Helpers
#### findResultResolver

* args
  * apiName - name of the api storing the results

```
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test_tests_result : graphqlHelpers.findResultResolver("tests"),
}
```
  
#### mapKeyResolver
Maps one key to another

* args
  * key - name of the key as it is coming into the resolver

```
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test : {
    id : graphqlHelpers.mapKeyResolver("_id")
  }
  ...
}
```

#### upsertResultResolver
* args
  * apiName - name of the api storing the results

```
const { graphqlHelpers } = require("@simpleview/sv-mongo-graphql-utils");
const resolvers = {
  test_tests_upsert_result : graphqlHelpers.upsertResultResolver("tests"),
}
```
