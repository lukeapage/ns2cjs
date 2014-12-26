root.AllLocals = function() {
    var jQuery;
    function func(root) {
        root.Comments.test();
        jQuery.destroy();
        var test = jQuery.access();
    };
    func();
};
