require("bit-docs-prettify");

require("prismjs/plugins/line-highlight/prism-line-highlight");
require("prismjs/plugins/line-highlight/prism-line-highlight.css");




var types = require("./codepen-data");
var languageHTML = /language-(\w+)/;

function createCodePen(data) {

    var JSONstring =
      JSON.stringify(data)
        // Quotes will screw up the JSON
        .replace(/"/g, "&​quot;") // careful copy and pasting, I had to use a zero-width space here to get markdown to post this.
        .replace(/'/g, "&apos;");


    var form =  '<form action="https://codepen.io/pen/define" method="POST" target="_blank">' +
        '<input type="hidden" name="data" value=\'' +
        JSONstring +
        '\'>' +
    '</form>';

    var div = document.createElement("div");
    div.innerHTML = form;
    document.body.appendChild(div);
    div.firstChild.submit();
    setTimeout(function(){
        document.body.removeChild(div);
    },10);
}


var matches = document.body.matches || document.body.msMatchesSelector;

function findPre(start) {
    while(start) {
        if(start.nodeName === "PRE") {
            return start;
        }
        if(start.querySelector) {
            var pre = start.querySelector("pre");
            if(pre) {
                return pre;
            }
        }

        // needs to be previousSibling for zombie
        start = start.previousSibling;
    }
}

module.exports = function() {

    document.body.addEventListener("click", function(ev){

        if(matches.call(ev.target, ".codepen")){

            var preElement = findPre(ev.target);

            if(preElement) {
                var codeElement = preElement.querySelector("code");
                var language = codeElement.className.match(languageHTML)[1];
                var text = codeElement.textContent;

                var data = types[language](text);
                if(docObject.codepen) {
                    docObject.codepen.forEach(function(replacement){
                        if(data.js) {
                            data.js = data.js.split(replacement[0]).join(replacement[1]);
                        }
                    });
                }
                if(data.js) {
                    data.js = data.js.trim();
                }
                if(data.html) {
                    data.html = data.html.trim();
                }
                if(data) {
                    if(window.CREATE_CODE_PEN) {
                        CREATE_CODE_PEN(data);
                    } else {
                        createCodePen(data);
                    }

                } else {
                    console.warn("Unable to create a codepen for this demo");
                }

            }
        }
    });
};
