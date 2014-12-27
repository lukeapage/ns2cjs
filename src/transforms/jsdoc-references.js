/**
 * @module ns2cjs/transforms/jsdoc
 */

/**
 * Runs this transform
 * @param {module:ns2cjs/file-info} fileInfo
 * @param {module:ns2cjs/transformer} transformer
 */
exports.run = function(fileInfo, transformer) {

    var ast = fileInfo.ast,
        codeFile = fileInfo.codeFile,
        moduleClasses = transformer.getModuleClasses(),
        namespaceChars = "a-z_-",
        classMatcher = "[^" + namespaceChars + "](",
        classMatcherRegexp,
        fileClass = fileInfo.getFileClass(),
        fileRootNamespace = fileClass.match(new RegExp("^[" + namespaceChars + "]+\\.", "i"))[0]
            .replace(/\.$/, "");

    for(var i = 0; i < moduleClasses.length; i++) {
        if (i > 0) {
            classMatcher += "|";
        }
        var namespaceMatch = moduleClasses[i];
        namespaceMatch = namespaceMatch.replace(/\./g, "\\.");
        classMatcher += namespaceMatch;
    }
    classMatcher += ")";
    classMatcherRegexp = new RegExp(classMatcher, "ig");

    ast.comments.forEach(function(comment) {
        // comment.value
        // comment.range[]
        var isJsDoc = comment.value.match(/^\*/);

        while(true) {
            var nextMatch = classMatcherRegexp.exec(comment.value);
            if (!nextMatch) {
                classMatcherRegexp.lastIndex = 0;
                break;
            }

            if (!isJsDoc) {
                transformer.warn(fileInfo, "Class found in non jsdoc (commented out code?) - ignoring", comment.range[0]);
                continue;
            }

            if (comment.value.substr(0, nextMatch.index).match(/@module\s*$/)) {
                continue;
            }

            // add 1 because we can't look behind so are matching a character we don't want
            // add 2 because the comment range is the start of the comment e.g. before /*
            var matchIndex = nextMatch.index + 1 + 2 + comment.range[0],
                fullClassName = nextMatch[1];

            codeFile.replace(matchIndex, matchIndex + fullClassName.length, "module:" + fullClassName.replace(".", "/"));
        }
    });
};
