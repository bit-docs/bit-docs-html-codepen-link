var assert = require("assert");
var generate = require("bit-docs-generate-html/generate");
var path = require("path");
var fs = require("fs");

var Browser = require("zombie");
var connect = require("connect");

var open = function(url, callback, done) {
	var server = connect().use(connect.static(path.join(__dirname, "temp"))).listen(8081);
	var browser = new Browser();
	browser.visit("http://localhost:8081/" + url)
		.then(function() {
			callback(browser, function() {
				server.close();
			});
		}).catch(function(e) {
			server.close();
			done(e);
		});
};

describe("bit-docs-html-codepen-link", function() {
	it("basics works", function(done) {
		this.timeout(60000);

		var docMap = Promise.resolve({
			index: {
				name: "index",
				demo: "path/to/demo.html",
				body: fs.readFileSync(__dirname+"/test-demo.md", "utf8"),
                codepen: [
                    ["can", "//unpkg.com/can@^5.0.0-pre.1/core.mjs"]
                ]
			}
		});

		generate(docMap, {
			html: {
				dependencies: {
					"bit-docs-html-codepen-link": __dirname
				}
			},
			dest: path.join(__dirname, "temp"),
			parent: "index",
			forceBuild: true,
			minifyBuild: false
		}).then(function() {
			open("index.html",function(browser, close) {
				var doc = browser.window.document;
                var createCallData = [];
                browser.window.CREATE_CODE_PEN = function(data){
                    createCallData.push(data);
                };
                var codePens = doc.querySelectorAll('.codepen');

                Array.from(codePens).forEach(function(codePen){
                    codePen.click();
                });
                assert.deepEqual(createCallData,[
                    {   html: '<my-app></my-app>',
                        js: 'import { Component } from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nComponent',
                        js_module: true,
                        editors: '1011' },
                    {   js: 'import {DefineMap} from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nconsole.log( myCounter.count ) //-> 1',
                        js_module: true,
                        editors: '0011' }
                ]);

				close();
				done();
			}, done);
		}, done);
	});
});
