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

test("odata-parser filter 1", t => {
    var ast = odataParser.parse("$filter=Name eq 'John' and LastName lt 'Doe'");
    // console.log("ast ", ast);
    t.truthy(ast);
});

test.only("odata-parser filter 2", t => {
    var ast = odataParser.parse("$filter=Name eq 'John' and LastName lt 'Doe' and x eq 1");
    // console.log("ast ", ast.$filter);
    // console.log("ast ", ast.$filter.right);
    t.truthy(ast);
});

test("single where 1", t => {
    var f = get(odataParser.parse("$filter=first_name eq 'Joe'"), "$filter");
    var wheres = lib(f);
    t.deepEqual(wheres, {first_name: "Joe"});
});
