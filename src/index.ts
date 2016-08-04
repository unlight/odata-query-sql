const _ = require("lodash");
const queryBuilder = require("@iamthes/query-builder");
const odataParser = require("odata-parser");

export = query;

function query(query, options = {}) {
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
    }
    var result: any = {};
    result.value = selectData(sql, data);
    if (hasCount) {
        result.count = selectCount(sql, data);
    }
    if (expands.length > 0) {
        result.expand = {};
        expands.forEach(property => {
            result.expand[property] = selectExpand(sql, property, data);
        });
    }
    return result;
}

function selectExpand(sql, name, {table, wheres}) {
    var idField = name + "_id"; // TODO: Fix hardcoded value
    sql.select(idField);
    sql.table(table);
    wheres.forEach(expr => {
        var method = expr.method;
        var args = expr.args || [];
        sql[method](...args);
    });
    var subquery = sql.get();
    var result = sql.select()
        .table(name)
        .where("id", "in", `@(${subquery})`)
        .get();
    return result;
}

function selectCount(sql, {table, wheres}) {
    sql.table(table);
    sql.select("count", "*", "");
    wheres.forEach(expr => {
        var method = expr.method;
        var args = expr.args || [];
        sql[method](...args);
    });
    return sql.get();
}

function selectData(sql, {table, selects, wheres, orderbys, offset, limit}) {
    sql.table(table);
    selects.forEach(s => sql.select(s));
    wheres.forEach(expr => {
        var method = expr.method;
        var args = expr.args || [];
        sql[method](...args);
    });
    orderbys.forEach(o => {
        var [field] = Object.keys(o);
        var direction = o[field];
        sql.orderBy(field, direction);
    });
    sql.limit(limit);
    if (offset) sql.offset(offset);
    return sql.get();
}

function parse(value: any, property: string): Array<any> {
    if (!value) return [];
    var {[property]: result} = odataParser.parse(`${property}=${value}`);
    return result;
}

function parseSelect(value: any) {
    var result = parse(value, "$select");
    if (result.length === 0) {
        result = ["*"];
    }
    return result;
}

function parseOffset(value: any) {
    return _.clamp(+value, 0, 500);
}

function parseLimit(value: any, d = 50) {
    value = +value;
    if (_.isNaN(value)) value = d;
    var result: number = _.clamp(value, 1, 500);
    return result;
}

function parseFilter(value: any) {
    if (!value) return [];
    var node = parse(value, "$filter");
    return traverse(node);
}

function traverse(node, acc = []) {
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
    throw new Error(`typeToMethod failed, unknown type ${type}.`);
}

function operatorToExpr(op) {
    switch (op) {
        case "eq": return "=";
        case "lt": return "<";
        case "le": return "<=";
        case "gt": return ">";
        case "ge": return ">=";
    }
    throw new Error(`operatorToExpr method failed, unknown operator ${op}.`);
}