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
}

module.exports = AllLocals;
