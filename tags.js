
exports.codepen = {
    add: function(line, curTagData, scope, docMap, defaultWriteProp, options) {
        var html = "<div class='codepen'></div>";
        var useCurData = validCurData && (typeof curData.description === "string") && !curData.body;

        // copies codepen options on to the docObject so they are accessible by the script
        if(options.codepen) {
            this.codepen = options.codepen;
        }

        if(useCurData) {
            curData.description += html;
        } else {
            this.body += html;
        }
    }
};
