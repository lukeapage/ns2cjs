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
        moduleNamespaces = transformer.getModuleNamespaces(),
        namespaceChars = "a-z_-",
        classMatcher = "[^" + namespaceChars + "]((",
        classMatcherRegexp,
        fileClass = fileInfo.getFileClass(),
        fileRootNamespace = fileClass.match(new RegExp("^[" + namespaceChars + "]+\\.", "i"))[0]
            .replace(/\.$/, "");

    for(var i = 0; i < moduleNamespaces.length; i++) {
        if (i > 0) {
            classMatcher += "|";
        }
        var namespaceMatch = moduleNamespaces[i];
        if (namespaceMatch.indexOf(".") > 0) {
            namespaceMatch = namespaceMatch.replace(/\./g, "\\.");
        } else {
            // top level namespace so match at least one more entry
            namespaceMatch += "\\.[" + namespaceChars + "]+";
        }
        classMatcher += namespaceMatch;
    }
    classMatcher += ")(\\.[" + namespaceChars + "]+)*)";
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

            if (isJsDoc) {
                // emit warning - class found in non js doc?
            }
            // add 1 because we can't look behind so are matching a character we don't want
            // add 2 because the comment range is the start of the comment e.g. before /*
            var matchIndex = nextMatch.index + 1 + 2 + comment.range[0],
                fullClassName = nextMatch[1];

            codeFile.replace(matchIndex, matchIndex + fullClassName.length, "module:" + fullClassName.replace(".", "/"));
        }
    });
};
