var merge, glob, concat, write, env, pipeline;
var ts;
var ava;

module.exports = function(pipelines) {

    pipelines["build"] = [
        glob({basePath: "src"}, "**/*.ts"),
        ts({module: "commonjs", target: "es5", inlineSources: true}),
        write("lib"),
        ava({files: "test/*.js", source: "src/**/*.ts", verbose: true})
    ];
};