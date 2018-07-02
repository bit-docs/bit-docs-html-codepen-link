
exports.codepen = {
    add: function(line, curData, scope, docMap, defaultWriteProp, options) {
        var html = "<div class='codepen'></div>";
        var validCurData =  (curData && curData.length !== 2);
        var useCurData = validCurData && (typeof curData.description === "string") && !curData.body;

        // copies codepen options on to the docObject so they are accessible by the script
        if(options.siteConfig.codepen) {
            this.codepen = options.siteConfig.codepen;
        }

        if(useCurData) {
            curData.description += html;
        } else {
            this.body += html;
        }
    }
};
