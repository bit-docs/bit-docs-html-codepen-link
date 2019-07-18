var scriptRegExp = /<script\s([^>]+)>([\s\S]*?)<\/script>/ig;
var styleRegExp = /<style>([\s\S]*?)<\/style>/i;
var lessRegExp = /<style type="text\/less">([\s\S]*?)<\/style>/i;
var templateRegExp = /<template\s?([^>]+)?>([\s\S]*?)<\/template>/ig;
var moduleTest = /type=["']([\w\/]+)["']/;
var srcTest = /src=/;
var DEFAULT_EDITORS = "0011";

function typescript(text) {
	return {
		js: text,
		js_pre_processor: "typescript",
		editors: DEFAULT_EDITORS
	};
}

var types = {
	html: function htmlType(text) {
		var result;
		var HTML = text;
		var textWithoutTemplates = text.replace(templateRegExp, "");

		textWithoutTemplates.replace(scriptRegExp, function(match, attrs, code) {
			var matchTest = attrs.match(moduleTest);
			var HTMLwithoutTemplates = HTML.replace(templateRegExp, "");

			// This has a src="".  We look for codepen-external
			if(srcTest.test(attrs)) {

			}
			// It doesn't have a src, so we assume this has a body
			else if (matchTest) {
				HTML = HTML.replace(match, "").trim();
				var CSS, PRECSS;
				var styleResults = HTMLwithoutTemplates.match(styleRegExp);
				if (styleResults) {
					HTML = HTML.replace(styleResults[0], "").trim();
					CSS = styleResults[1].trim();
				}
				var lessResults = HTMLwithoutTemplates.match(lessRegExp);
				if (lessResults) {
					HTML = HTML.replace(lessResults[0], "").trim();
					CSS = lessResults[1].trim();
					PRECSS = 'less';
				}
				if (types[matchTest[1]]) {
					result = types[matchTest[1]](code.trim());
				} else {
					result = types.js(code.trim());
				}
				result.editors = "1011";
				if (HTML) {
					result.html = HTML;
				}
				if (CSS) {
					result.css = CSS;

					if (PRECSS) {
						result.css_pre_processor = PRECSS;
					}
				}
			}
		});

		// If there are no scripts the should at least be HTML
		if(!result) {
			result = {
				html: HTML,
				editors: DEFAULT_EDITORS
			}
		}

		return result;
	},
	js: function(text) {
		return {
			js: text,
			js_module: true,
			editors: DEFAULT_EDITORS
		};
	},
	typescript: typescript,
	ts: typescript,
	jsx: function(text) {
		return {
			js: text,
			js_pre_processor: "babel",
			editors: DEFAULT_EDITORS
		};
	}
};

module.exports = types;
