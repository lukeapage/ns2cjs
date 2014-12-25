/**
 * @module root/FindsGlobals
 */

var jQuery = require("jQuery");

var FindsGlobals = function(local) {
    jQuery("hi");//.push(new root.TestOne(root.Comments));
    //return root.Comments.GLOBALS;
    local = true;
    local = local.fun;
};

module.exports = FindsGlobals;
