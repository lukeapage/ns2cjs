root.AllLocals = function() {
    var jQuery;
    function func(root) {
        root.Comments.test();
        jQuery.destroy();
        var test = jQuery.access();
    };
    func();
    try {
        var a = {
            emitr: true
        }, b = new Array(parseInt("2"));
    } catch(oError) {
        oError = "A Local Var";
    }
};
