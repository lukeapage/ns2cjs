/**
 * @module ns2cjs/transforms/jsdoc
 */

/**
 * Runs this transform
 * @param {module:ns2cjs/code-file} codeFile
 * @param {module:ns2cjs/transform-info} transformInfo
 * @param {object} ast
 */
exports.run = function(codeFile, transformInfo, ast) {

    var fileClass = transformInfo.getFileClass(),
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
