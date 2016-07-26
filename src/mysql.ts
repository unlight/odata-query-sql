const _ = require("lodash");
const queryBuilder = require("@iamthes/query-builder");
const q = queryBuilder.create("mysql");
const odataParser = require("odata-parser");

export = function (oquery, {resource}) {

    var select = parseSelect(oquery.$select);
    var filter = parseFilter(oquery.$filter);
    var top = parseTop(oquery.$top);

    return { select, filter, top };
}

function parseSelect(s: string) {
}

function parseNumber(any: any, d = 50) {
    var n = +any;
    if (_.isNan(n))
    if ()
}

function parseFilter(s: string) {
    var node = odataParser.parse(s);
    if (node.left.type !== "property") {
        var left = traverse(node.left);
    }
    if (node.right.type !== "literal") {
        var right = traverse(node.right);
    }
    var result = { type: node.type, left, right };
    console.log("result ", result);
}

function traverse(node) {
    if (node.left.type !== "property") {
        var left = traverse(node.left);
    }
    if (node.right.type !== "literal") {
        var right = traverse(node.right);
    }
    return traverse({ type: node.type, left, right });
}