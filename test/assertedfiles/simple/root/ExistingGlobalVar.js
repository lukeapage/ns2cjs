/**
 * @module root/ExistingGlobalVar
 */

var jQuery = require("jquery"),
    Comments = require("root/Comments");

function ExistingGlobalVar() {
    jQuery.find(".classes");
    Comments["Class"].call(this);
}

module.exports = ExistingGlobalVar;
