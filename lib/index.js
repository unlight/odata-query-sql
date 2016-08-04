"use strict";
var _ = require("lodash");
var queryBuilder = require("@iamthes/query-builder");
var odataParser = require("odata-parser");
function query(query, options) {
    if (options === void 0) { options = {}; }
    var dialect = _.get(options, "dialect");
    var sql = queryBuilder.create(dialect)();
    var resource = _.get(options, "resource");
    var defaultLimit = _.get(options, "defaultLimit", 50);
    var hasCount = _.has(query, "$count");
    var expands = parse(query.$expand, "$expand");
    var data = {
        table: resource,
        selects: parseSelect(query.$select),
        wheres: parseFilter(query.$filter),
        offset: parseOffset(query.$skip),
        limit: parseLimit(query.$top, defaultLimit),
        orderbys: parse(query.$orderby, "$orderby")
    };
    var result = {};
    result.value = selectData(sql, data);
    if (hasCount) {
        result.count = selectCount(sql, data);
    }
    if (expands.length > 0) {
        result.expand = {};
        expands.forEach(function (property) {
            result.expand[property] = selectExpand(sql, property, data);
        });
    }
    return result;
}
function selectExpand(sql, name, _a) {
    var table = _a.table, wheres = _a.wheres;
    var idField = name + "_id"; // TODO: Fix hardcoded value
    sql.select(idField);
    sql.table(table);
    wheres.forEach(function (expr) {
        var method = expr.method;
        var args = expr.args || [];
        sql[method].apply(sql, args);
    });
    var subquery = sql.get();
    var result = sql.select()
        .table(name)
        .where("id", "in", "@(" + subquery + ")")
        .get();
    return result;
}
function selectCount(sql, _a) {
    var table = _a.table, wheres = _a.wheres;
    sql.table(table);
    sql.select("count", "*", "");
    wheres.forEach(function (expr) {
        var method = expr.method;
        var args = expr.args || [];
        sql[method].apply(sql, args);
    });
    return sql.get();
}
function selectData(sql, _a) {
    var table = _a.table, selects = _a.selects, wheres = _a.wheres, orderbys = _a.orderbys, offset = _a.offset, limit = _a.limit;
    sql.table(table);
    selects.forEach(function (s) { return sql.select(s); });
    wheres.forEach(function (expr) {
        var method = expr.method;
        var args = expr.args || [];
        sql[method].apply(sql, args);
    });
    orderbys.forEach(function (o) {
        var field = Object.keys(o)[0];
        var direction = o[field];
        sql.orderBy(field, direction);
    });
    sql.limit(limit);
    if (offset)
        sql.offset(offset);
    return sql.get();
}
function parse(value, property) {
    if (!value)
        return [];
    var _a = property, result = odataParser.parse(property + "=" + value)[_a];
    return result;
}
function parseSelect(value) {
    var result = parse(value, "$select");
    if (result.length === 0) {
        result = ["*"];
    }
    return result;
}
function parseOffset(value) {
    return _.clamp(+value, 0, 500);
}
function parseLimit(value, d) {
    if (d === void 0) { d = 50; }
    value = +value;
    if (_.isNaN(value))
        value = d;
    var result = _.clamp(value, 1, 500);
    return result;
}
function parseFilter(value) {
    if (!value)
        return [];
    var node = parse(value, "$filter");
    return traverse(node);
}
function traverse(node, acc) {
    if (acc === void 0) { acc = []; }
    if (node.left.type === "property" && node.right.type === "literal") {
        acc.push({
            method: "where",
            args: [node.left.name, operatorToExpr(node.type), node.right.value]
        });
        return acc;
    }
    traverse(node.left, acc);
    acc.push({ method: typeToMethod(node.type) });
    traverse(node.right, acc);
    return acc;
}
function typeToMethod(type) {
    switch (type) {
        case "and": return "andOp";
        case "or": return "orOp";
    }
    throw new Error("typeToMethod failed, unknown type " + type + ".");
}
function operatorToExpr(op) {
    switch (op) {
        case "eq": return "=";
        case "lt": return "<";
        case "le": return "<=";
        case "gt": return ">";
        case "ge": return ">=";
    }
    throw new Error("operatorToExpr method failed, unknown operator " + op + ".");
}
module.exports = query;
//# sourceMappingURL=index.js.map