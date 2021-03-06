var assert = require("assert");
var generate = require("bit-docs-generate-html/generate");
var path = require("path");
var fs = require("fs");
var codepenData = require("./codepen-data");

var Browser = require("zombie");
var connect = require("connect");

var open = function(url, callback, done) {
	var server = connect().use(connect.static(path.join(__dirname))).listen(8081);
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
				body: fs.readFileSync(__dirname + "/test-demo.md", "utf8"),
				codepen: [
					["can", "//unpkg.com/can@^5.0.0-pre.1/core.mjs"]
				]
			}
		});

		generate(docMap, {
			html: {
				dependencies: {
					"bit-docs-html-codepen-link": __dirname,
					"bit-docs-prettify": "^0.4.0",
					"bit-docs-tag-demo": "^0.5.3"
				}
			},
			dest: path.join(__dirname, "temp"),
			parent: "index",
			forceBuild: true,
			minifyBuild: false
		}).then(function() {
			open("temp/index.html", function(browser, close) {
				var doc = browser.window.document;

				var createCallData = [];
				browser.window.CREATE_CODE_PEN = function(data) {
					createCallData.push(data);
				};

				var toolbars = doc.querySelectorAll('.toolbar');
				toolbars.forEach(function(toolbar) {
					var btn = toolbar.children[toolbar.children.length - 1].querySelector('button');
					btn.click();
				});

				assert.deepEqual(createCallData, [
					{
						html: '<my-app></my-app>',
						js: 'import { Component } from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nComponent',
						js_module: true,
						editors: '1011',
						css: 'my-app {color: "green";}'
					},
					{
						html: '<div id="root"></div>\n<script crossorigin src="//unpkg.com/react@16/umd/react.development.js"></script>\n<script crossorigin src="//unpkg.com/react-dom@16/umd/react-dom.development.js"></script>\n<my-app></my-app>',
						js: 'import { Component } from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nComponent',
						js_module: true,
						editors: '1011',
						css: 'my-app {color: "green";}'
					},
					{
						js: 'import {DefineMap} from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nconsole.log( myCounter.count ) //-> 1',
						js_module: true,
						editors: '0011'
					},
					{
						css: 'h1 {color: red;}',
						editors: '1011',
						html: '<h1>Hi There!</h1>',
						js: 'var code = "code";',
						js_module: true
					},
					{
						css: 'h1 {color: red;}',
						editors: '1011',
						html: '<h1>Hi There!</h1>',
						js: 'var code = "code";',
						js_module: true
					},
					{
						html: '<div id="root"></div>\n<script crossorigin src="//unpkg.com/react@16/umd/react.development.js"></script>\n<script crossorigin src="//unpkg.com/react-dom@16/umd/react-dom.development.js"></script>\n',
						js: 'import {DefineMap} from "//unpkg.com/can@^5.0.0-pre.1/core.mjs";\nconsole.log( myCounter.count ) //-> 1',
						js_module: true,
						editors: '0011'
					}
				]);

				close();
				done();
			}, done);
		}, done);
	});

	it("is able to ignore scripts with sources", function() {
		var data = codepenData.html(`
			<mock-url></mock-url>
			<bit-json-editor></bit-json-editor>
			<script src="//unpkg.com/mock-url@^5.0.0" type="module"></script>
			<script src="//unpkg.com/bit-json-editor@^5.0.0" type="module"></script>
			<script type="module">
			foo = "bar";
			</script>
			<style>
			bit-json-editor { height: 200px; }
			</style>
		`);
		assert.equal(data.js, 'foo = "bar";')
	});

	it("is able to parse typescript in html", function() {
		var data = codepenData.html(`
			<script type="typescript">
			function greeter(person: string) { return "Hello, " + person; }
			</script>
		`);
		assert.equal(data.js.trim(), 'function greeter(person: string) { return "Hello, " + person; }');
		assert.equal(data.js_pre_processor, 'typescript');
	});

	it("is able to parse jsx in html", function() {
		var data = codepenData.html(`
			<script type="jsx">
			const element = <h1>Hello, world!</h1>;
			</script>
		`);
		assert.equal(data.js.trim(), 'const element = <h1>Hello, world!</h1>;');
		assert.equal(data.js_pre_processor, 'babel');
	});

	it("is able to parse less in html", function() {
		var data = codepenData.html(`
			<style type="text/less">
				@custom-color: #454545;
			</style>
			<span>Hello.</span>
			<script type="module">
				function greeter(person) { return "Hello, " + person; }
			</script>
		`);
		console.log(JSON.stringify(data));
		assert.equal(data.css.trim(), '@custom-color: #454545;');
		assert.equal(data.css_pre_processor, 'less');
	});

	it.skip("is able to create external js", function(){
		var data = codepenData.html(`
			<script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.2.1/rxjs.umd.js" codepen-external></script>
			<script src="https://foo.com" codepen-external></script>
			<script type="typescript">
			const {Observable} = rxjs;
			</script>
		`);
		assert.equal(data.js.trim(), 'const {Observable} = rxjs;');
		assert.equal(data.js_pre_processor, 'typescript');
		assert.equal(data.js_external,'https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.2.1/rxjs.umd.js;https://foo.com');
		assert.equal(data.html, undefined, "no html")
	});

	it("works when there is no js", function() {
		var data = codepenData.html(`
<div>Hello world</div>
		`)

		assert(data, "got data");
		assert.equal(data.html.trim(), "<div>Hello world</div>");
	});

	it("Does not remove styles from within a template", function() {
		var data = codepenData.html(`
<template>
	<style>.root { display: block; }</style>
</template>
<script type="module"></script>
		`);

		assert(!data.css, "There should not be css");
		assert.equal(data.html.trim(), `
<template>
	<style>.root { display: block; }</style>
</template>
		`.trim());
	});

	it("Does not remove scripts from within a template", function() {
		var data = codepenData.html(`
<template>
	<script>console.log('testing');</script>
</template>
<script type="module"></script>
		`);

		assert(!data.js, "There should not be js");
		assert.equal(data.html.trim(), `
<template>
	<script>console.log('testing');</script>
</template>
		`.trim());
	});

	it("Does not remove module scripts from within a template", function() {
		var data = codepenData.html(`
<template>
	<script type="module">console.log('testing');</script>
</template>
<script type="module"></script>
		`);

		assert(!data.js, "There should not be js");
		assert.equal(data.html.trim(), `
<template>
	<script type="module">console.log('testing');</script>
</template>
		`.trim());
	});

	it("Does not remove styles2", function() {
		var data = codepenData.html(`
		<template id="tmpl">
			<style>
			</style>
			<div class="gmap"></div>
		</template>
		<script type="module"></script>`);

		var html = data.html.trim();
		assert.ok(/style/.test(html));
		assert.equal(html, `<template id="tmpl">
			<style>
			</style>
			<div class="gmap"></div>
		</template>`)
	});

	it("supports ts files", function() {
		assert.ok(codepenData.ts, "there is a ts");
	});

	it("Registers run code button", function(done) {
		this.timeout(60000);

		var docMap = Promise.resolve({
			index: {
				name: "index",
				demo: "path/to/demo.html",
				body: fs.readFileSync(__dirname + "/test-demo.md", "utf8"),
				codepen: [
					["can", "//unpkg.com/can@^5.0.0-pre.1/core.mjs"]
				]
			}
		});

		generate(docMap, {
			html: {
				dependencies: {
					"bit-docs-html-codepen-link": __dirname,
					"bit-docs-prettify": "^0.4.0",
					"bit-docs-tag-demo": "^0.5.3"
				}
			},
			dest: path.join(__dirname, "temp"),
			parent: "index",
			forceBuild: true,
			minifyBuild: false
		}).then(function() {
			open("temp/index.html", function(browser, close) {
				var doc = browser.window.document;
				var toolbars = doc.querySelectorAll(".code-toolbar");
				toolbars.forEach(function(toolbar) {
					var children = toolbar.children;
					assert.equal(toolbar.children.length, 2);
					assert.equal(children[children.length - 1].innerHTML, '<div class="toolbar-item"><button>Copy</button></div><div class="toolbar-item"><button data-run="">Run</button></div>');
				});
				close();
				done();
			}, done);
		}, done);
	});
});
