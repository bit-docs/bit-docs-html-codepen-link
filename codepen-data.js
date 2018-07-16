var scriptRegExp = /<script\s([^>]+)>([\s\S]*?)<\/script>/ig;
var styleRegExp = /<style>([\s\S]*?)<\/style>/i;
var moduleTest = /type=["']module["']/;
var srcTest = /src=/;
var types = {
    html: function htmlType(text){

        var result;

        text.replace(scriptRegExp, function(match, attrs, code){
            
            if(moduleTest.test(attrs) && !srcTest.test(attrs)) {

                var HTML = text.replace(match,"").trim();

                var styleResults = HTML.match(styleRegExp);
                if(styleResults) {
                    HTML = HTML.replace(styleResults[0],"").trim();
                    result = {
                        html: HTML,
                        js: code.trim(),
                        js_module: true,
                        editors: "1011",
                        css: styleResults[1].trim()
                    };
                } else {
                    result =  {
                        html: HTML,
                        js: code.trim(),
                        js_module: true,
                        editors: "1011"
                    };
                }


            }
        });
        return result;
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
