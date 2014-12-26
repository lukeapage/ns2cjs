/**
 * @module ns2cjs/transforms/jsdoc
 */

/**
 * Runs this transform
 * @param {module:ns2cjs/file-info} fileInfo
 */
exports.run = function(fileInfo, transformer) {

    var ast = fileInfo.ast,
        codeFile = fileInfo.codeFile,
        fileClass = fileInfo.getFileClass(),
        hasModuleComment = false,
        moduleIdentifier = fileClass.replace(".", "/");


    ast.comments.forEach(function(comment) {
        var isJsDoc = comment.value.match(/^\*/),
            isConstructor = comment.value.match(/@constructor/),
            moduleComment = comment.value.match(/@module\s+([^\s\n]+)?/);

        if (moduleComment) {
            if (!isJsDoc) {
                transformer.warn(fileInfo, "module comment found in non-jsdoc", comment.range[0]);
            }
            if (hasModuleComment) {
                transformer.warn(fileInfo, "Multiple module comments found in file to convert", comment.range[0]);
            }
            if (!moduleComment[1]) {
                transformer.warn(fileInfo, "module comment found with non understandable identifier", comment.range[0]);
            } else {
                if (moduleComment[1] !== moduleIdentifier) {
                    transformer.warn(fileInfo,
                        "module comment does not match expected - " + moduleComment[1] + " != " + moduleIdentifier,
                        comment.range[0]);
                }
            }
            hasModuleComment = true;
        }
    });

    if (!hasModuleComment) {
        codeFile.insert(0, "/**\n * @module " + moduleIdentifier + "\n */\n\n");
    }
};
