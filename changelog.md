# sv-mongo-graph-utils changelog

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