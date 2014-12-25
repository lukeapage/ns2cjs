/**
 * @module root/FindsGlobals
 */

var jQuery = require("jQuery");

var FindsGlobals = function() {
    jQuery("hi");//.push(new root.TestOne(root.Comments));
    //return root.Comments.GLOBALS;
};

module.exports = FindsGlobals;
