/**
 * @module root/FindsGlobals
 */

var $ = require("jquery"),
    root = require("root/renamed");

function FindsGlobals() {
	var $v = $.find(".class"),
		$w = $.find($v, ".second");
}
root.class(FindsGlobals);
module.exports = FindsGlobals;
