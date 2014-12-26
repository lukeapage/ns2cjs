/**
 * @module root/ExistingGlobalVar
 */

var jQuery = require("jquery");

function ExistingGlobalVar() {
    jQuery.find(".classes");
}

module.exports = ExistingGlobalVar;
