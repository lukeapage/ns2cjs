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

    var topLevelNamespaces = transformInfo.getTopLevelNamespaces().slice(0),
        namespaceChars = "a-z_-",
        classMatcher = "[^" + namespaceChars + "]((",
        classMatcherRegexp,
        fileClass = transformInfo.getFileClass(),
        fileRootNamespace = fileClass.match(new RegExp("^[" + namespaceChars + "]+\\.", "i"))[0]
            .replace(/\.$/, ""),
        hasModuleComment = false;

    if (topLevelNamespaces.indexOf(fileRootNamespace) < 0) {
        topLevelNamespaces = topLevelNamespaces.slice(0);
        topLevelNamespaces.push(fileRootNamespace);
    }

    for(var i = 0; i < topLevelNamespaces.length; i++) {
        if (i > 0) {
            classMatcher += "|";
        }
        classMatcher += topLevelNamespaces[i];
    }
    classMatcher += ")(\\.[" + namespaceChars + "]+)+)";
    classMatcherRegexp = new RegExp(classMatcher, "ig");

    ast.comments.forEach(function(comment) {
        // comment.value
        // comment.range[]
        var isJsDoc = comment.value.match(/^\*/),
            isConstructor = comment.value.match(/@constructor/);

        if (comment.value.match(/@module/)) {
            hasModuleComment = true;
        }

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

    if (hasModuleComment) {
        // emit warning
    } else {
        codeFile.insert(0, "/**\n * @module " + fileClass.replace(".", "/") + "\n */\n\n");
    }
};
