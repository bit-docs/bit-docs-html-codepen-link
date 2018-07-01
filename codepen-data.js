var scriptRegExp = /<script\s([^>]+)>([\s\S]*?)<\/script>/i;
var moduleTest = /type=["']module["']/;
var types = {
    html: function htmlType(text){
        // test if a module script tag exists
        var results = text.match(scriptRegExp);
        if(results) {
            var attrs = results[1];
            if(moduleTest.test(attrs)) {

                var HTML = text.replace(results[0],"").trim();

                return {
                    html: HTML,
                    js: results[2],
                    js_module: true,
                    editors: "1011"
                };
            }
        }
    },
    js: function (text){
        return {
            js: text,
            js_module: true,
            editors: "0011"
        };
    }
};

module.exports = types;
