/**
 * @module ns2cjs/transforms/jsdoc
 */

/**
 * Runs this transform
 * @param {module:ns2cjs/file-info} fileInfo
 */
exports.run = function(fileInfo) {

    var ast = fileInfo.ast,
        codeFile = fileInfo.codeFile,
        fileClass = fileInfo.getFileClass(),
        hasModuleComment = false;


    ast.comments.forEach(function(comment) {
        // comment.value
        // comment.range[]
        var isJsDoc = comment.value.match(/^\*/),
            isConstructor = comment.value.match(/@constructor/);

        if (isJsDoc && comment.value.match(/@module/)) {
            hasModuleComment = true;
        }
    });

    if (hasModuleComment) {
        // emit warning
    } else {
        codeFile.insert(0, "/**\n * @module " + fileClass.replace(".", "/") + "\n */\n\n");
    }
};
