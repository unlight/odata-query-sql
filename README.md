odata-query-sql
===============
Converts odata query to sql query.

INSTALL
-------
```js
npm i -S odata-query-sql
```

USAGE
-----
```js
var odataQuerySql = require("odata-query-sql");
var result = odataQuerySql(oquery, options);
```

API
---
* `oquery` odata query object ($select, $filter, etc.)
* `options.dialect` type of sql driver (mysql, sqlite)
* `options.resource` requested resource name (table) 
* `options.defaultLimit` limit should be set (min = 1, max = 500, default = 50)

EXAMPLES
--------
```js
var odataQuerySql = require("odata-query-sql");
var oquery = { $count: true, $filter: "name eq 'Ivan'", };
var options = { resource: "user", dialect: "mysql" });
var result = odataQuerySql(oquery, options);
// result.count: "select count(*) from user where name = 'Ivan'"
// result.value: "select * from user where name = 'Ivan' limit 50"
```

```js
var odataQuerySql = require("odata-query-sql");
var oquery = { $expand: "category", $filter: "title eq 'moby dick'", $select: "title"};
var options = { resource: "book", dialect: "mysql" }
var result = odataQuerySql(oquery, options);
// result.value: "select * from book where title = 'moby dick' limit 50"
// result.expand.category: 
// "select * from category where id in (select category_id from book where title = 'moby dick')"
```

CHANGELOG
---------
* 0.0.1 (15 Aug 2016) first release