/**
 * @module root/FindsGlobals
 */

var jQuery = require("jQuery"),
    TestOne = require("root/TestOne"),
    Comments = require("root/Comments");

var FindsGlobals = function(local) {
    jQuery("hi").push(new TestOne(Comments));
    local = true;
    local = local.fun;
    return Comments.GLOBALS;
};

module.exports = FindsGlobals;
