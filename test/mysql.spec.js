import test from "ava";
import lib from "../lib";

test("smoke test", t => {
    t.truthy(lib);
});

test("select name", t => {
    var query = { $select: "name" };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select name from user limit 500");
});

test("nothing", t => {
    var query = {};
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user limit 500");
});

test("skip", t => {
    var query = { $skip: 5, $top: 10 };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user limit 5, 10");
});

test("filter name eq ivan", t => {
    var query = { $filter: "name eq 'Ivan'" };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user where name = 'Ivan' limit 500");
});

test("filter simple and", t => {
    var $filter = "name eq 'John' or name lt 'Doe' and address gt 'x1234'";
    var query = { $filter, $top: 1 };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user where name = 'John' or name < 'Doe' and address > 'x1234' limit 1");
});

test.failing("filter and with or", t => {
    var $filter = "(name eq 'John' or name lt 'Doe') and name gt 'x1234'";
    var query = { $filter, $top: 1 };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user where (name = 'John' or name < 'Doe') and address > 'x1234' limit 1");
});

test("count", t => {
    var query = { $count: "" };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.count, "select count(*) from user");
    t.is(result.value, "select * from user limit 500");
});

test("count with filter", t => {
    var query = { $count: "", $filter: "name eq 'Ivan'" };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.count, "select count(*) from user where name = 'Ivan'");
    t.is(result.value, "select * from user where name = 'Ivan' limit 500");
});

test("order by", t => {
    var query = { $orderby: "id desc, name asc" };
    var result = lib(query, { resource: "user", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from user order by id desc, name asc limit 500");
});

test("expand base 1:m", t => {
    var query = { $expand: "category", $filter: "title eq 'moby dick'" };
    var result = lib(query, { resource: "book", defaultLimit: 500, dialect: "mysql" });
    t.is(result.value, "select * from book where title = 'moby dick' limit 500");
    t.is(result.expand.category, "select * from category where id in (select category_id from book where title = 'moby dick')");
});