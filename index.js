var types = require("./codepen-data");
var specials = require("./specials");
var languageHTML = /language-(\w+)/;

function cleanCodePenData(data) {
    if(docObject.codepen) {
        docObject.codepen.forEach(function(replacement){
            if(data.html) {
                data.html = data.html.split(replacement[0]).join(replacement[1]);
            }

            if(data.js) {
                data.js = data.js.split(replacement[0]).join(replacement[1]);
            }
        });
    }
}

function createCodePen(data) {
    var JSONstring = JSON.stringify(data);

    var form =
        '<form action="https://codepen.io/pen/define" method="POST" target="_blank">' +
            '<input type="hidden" name="data">' +
        '</form>';

    var div = document.createElement("div");
    div.innerHTML = form;
    div.firstChild.firstChild.value = JSONstring;
    document.body.appendChild(div);
    div.firstChild.submit();

    setTimeout(function(){
        document.body.removeChild(div);
    },10);
}

var browserMatches = document.body.matches || document.body.msMatchesSelector;
function matches(selector) {
    if(this.nodeType === 1) {
        if(selector.indexOf(",") >= 0 ) {
            return selector.split(",").some(function(selector){
                return browserMatches.call(this, selector);
            }, this);
        } else {
            return browserMatches.call(this, selector);
        }
    } else {
        return false;
    }
}

function findSelector(start, selector) {
    while(start) {
        if(matches.call(start, selector)) {
            return start;
        }

        if(start.querySelector) {
            var pre = start.querySelector(selector);
            if(pre) {
                return pre;
            }
        }

        // needs to be previousSibling for zombie
        start = start.previousSibling;
    }
}

function findDemoWrapper(el) {
    while(el && el.parentNode) {
        if(matches.call(el.parentNode, '.demo_wrapper')) {
            return el.parentNode;
        }

        el = el.parentNode;
    }
}

function findPreForToolbarBtn(el) {
    while(el) {
        if (el.nodeName === "PRE") {
            return el;
        }

        if (matches.call(el, '.toolbar')) {
            el = findSelector(el, 'pre');
        } else {
            el = el.parentNode;
        }
    }
}

function getStylesFromIframe(iframe) {
    var styles = iframe.contentDocument.documentElement.querySelectorAll("style");
    var cssText = "";
    styles.forEach(function(style){
        cssText += style.innerHTML;
    });

    return cssText;
}

var isRegistered = false;

module.exports = function() {
    var codepens = document.querySelectorAll('div.codepen');
    //remove the old codepen links
    codepens.forEach(function(codepen){
        var wrapper = findSelector(codepen, "pre, .demo_wrapper");
        var special = codepen.getAttribute("data-codepen");

        //the CodePen iframe wrapper has ".codepen" class too
        if (wrapper) {
            wrapper.setAttribute('data-has-run', true);
            if (special) {
                wrapper.setAttribute('data-codepen', special);
            }

            codepen.parentNode.removeChild(codepen);
        }
    });

    if (!isRegistered) {
        //Register PrismJS "Run" custom button
        Prism.plugins.toolbar.registerButton("run-code", function(env) {
            isRegistered = true;
            var demoWrapper = findDemoWrapper(env.element);
            var pre = env.element.parentElement;
            var hasRunBtn = demoWrapper ? demoWrapper.getAttribute("data-has-run") : pre.getAttribute("data-has-run");

            //prevent other demos without codepen link to register Run button
            if (hasRunBtn) {
                var btn = document.createElement("button");
                btn.innerHTML = "Run";
                btn.setAttribute("data-run", "");

                return btn;
            }
        });

        document.body.addEventListener('click', function (ev) {
            if (ev.target.getAttribute('data-run') != null) {
                var btn = ev.target;
                var demoWrapper = findDemoWrapper(btn);

                if (!demoWrapper) {
                    var preElement = findPreForToolbarBtn(btn);
                    var codeElement = preElement.querySelector("code");
                    var language = codeElement.className.match(languageHTML)[1];
                    var text = codeElement.textContent;

                    var data = types[language](text);

                    if(data.js) {
                        data.js = data.js.trim();
                    }
                    if(data.html) {
                        data.html = data.html.trim();
                    }

                    var special = preElement.getAttribute("data-codepen");
                    if (special && specials[special]) {
                        specials[special](data);
                    }

                    if(data) {
                        cleanCodePenData(data);
                        if(window.CREATE_CODE_PEN) {
                            CREATE_CODE_PEN(data);
                        } else {
                            createCodePen(data);
                        }
                    } else {
                        console.warn("Unable to create a codepen for this demo");
                    }
                }

                if (demoWrapper && matches.call(demoWrapper, '.demo_wrapper')) {
                    var htmlCode = demoWrapper.querySelector('[data-for=html] code');
                    var htmlText = htmlCode ? htmlCode.textContent.trim() : '';
                    var jsCode = demoWrapper.querySelector('[data-for=js] code');
                    var jsText = jsCode ? jsCode.textContent.trim() : '';
                    var cssText = getStylesFromIframe(demoWrapper.querySelector('iframe'));

                    var special = demoWrapper.getAttribute("data-codepen");
                    if (special && specials[special]) {
                        specials[special](data);
                    }

                    var codePen = {
                        html: htmlText,
                        js: jsText,
                        js_module: true,
                        editors: '1011',
                        css: cssText.trim()
                    };

                    cleanCodePenData(codePen);
                    if (window.CREATE_CODE_PEN) {
                        CREATE_CODE_PEN(codePen);
                    } else {
                        createCodePen(codePen);
                    }
                }
            }
        });
    }
};
