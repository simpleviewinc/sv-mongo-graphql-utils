# sv-mongo-graph-utils changelog

## 5.0.0

[MCE-2061](https://simpleviewtools.atlassian.net/browse/MCE-2061)

**Breaking changes**

* **Node:** Requires Node.js 20 or later. Dockerfile base image updated from `node:16.20.2` to `node:20`.
* **MongoDB driver:** Upgraded from 5.x to 7.x. `peerDependencies` and `devDependencies` now use `mongodb` ^7.0.0. Removed deprecated `useNewUrlParser` and `useUnifiedTopology` options from `MongoClient.connect()` (no longer supported in driver 7).
* **Express:** Removed unused `express` dependency from the package.
* **graphql-tag:** Removed `graphql-tag` from `devDependencies`. Test schema typeDefs now use plain template literals with a `#graphql` comment for editor highlighting.

**Other**

* Upgraded `lodash` to 4.17.23 (security fixes). Relaxed `graphql` to ^16.6.0 for patch updates.
* Docker Compose: pinned Mongo service to `mongo:7.0`, removed deprecated `version` key, and removed unused `PG_HOST` and `POSTGRES_PASSWORD` environment variables.

## 2/19/2025
* Upgrades to address CVE security vulnerabilities. [MCE-1461](https://simpleviewtools.atlassian.net/browse/MCE-1461).
* Upgraded `node` in Dockerfile from `14.16.0` to `16.20.2`.

## 4/27/2023
* Removed `apollo-server`
* Added `graphql-tag` to `devDependencies`

## 2/21/2023
* Updated `mongodb` package to 5.0.0 from 3.6.4
* Added mongo `peerDependencies` ^5.0.0
* Removed `mongodb` dependency and added `mongodb` 5.0.0 to `devDependencies`
* Added `new` to any calls to the `ObjectId` class
* Updated NPM version from 3.0.0 to 4.0.0