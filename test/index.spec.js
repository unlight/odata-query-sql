import test from "ava";
import lib from "..";
import {get} from "lodash";

const query = require("oquery");
const odataParser = require("odata-parser");

test("lib smoke test", t => {
    t.truthy(lib);
});

test("oquery smoke test", t => {
    const q = query().filter("foo === 1 || (foo <= 2)").value();
    t.is("$filter=foo eq 1 or (foo le 2)", q);
});

test("odata-parser smoke test", t => {
    var ast = odataParser.parse("$top=10&$skip=5&$select=foo");
    t.deepEqual(ast, { '$top': 10, '$skip': 5, '$select': ['foo'] });
});