/**
 * @module root/AllLocals
 */

function AllLocals() {
    var jQuery;
    function func(root) {
        root.Comments.test();
        jQuery.destroy();
        var test = jQuery.access();
    };
    func();
    var a = {
        emitr: true
        }, b = new Array(parseInt("2"));
}

module.exports = AllLocals;
