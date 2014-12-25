root.FindsGlobals = function(local) {
    jQuery("hi").push(new root.TestOne(root.Comments));
    local = true;
    local = local.fun;
    return root.Comments.GLOBALS;
};
