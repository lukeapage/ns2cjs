/**
 * @module root/FindsGlobals
 */

var jQuery = require("jquery"),
    TestOne = require("root/TestOne"),
    Comments = require("root/Comments");

function FindsGlobals(local) {
    jQuery("hi").push(new TestOne(Comments));
    local = true;
    local = local.fun;
    return Comments.GLOBALS;
}

module.exports = FindsGlobals;
