/**
 * @module ns2cjs/transforms/code
 */

var astTraverse = require("../ast-traverse");

function astToString(node) {
    if (node.type === "MemberExpression") {
        return astToString(node.object) + "." + astToString(node.property);
    } else if (node.type === "Identifier" ) {
        return node.name;
    }
    console.log(node);
}

/**
 * Runs this transform
 * @param {module:ns2cjs/file-info} fileInfo
 */
exports.run = function(fileInfo) {

    var ast = fileInfo.ast,
        codeFile = fileInfo.codeFile,
        fileClass = fileInfo.getFileClass(),
        fileClassSplit = fileClass.split("."),
        className = fileClassSplit[fileClassSplit.length - 1],
        inAssignment = false;

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=") {
            var leftSide = astToString(node.left);
            if (leftSide.indexOf(fileClass) === 0) {
                var start = node.left.range[0];
                if (leftSide === fileClass) {
                    // constructor assignment
                    codeFile.replace(start, start + fileClass.length, "var " + className);
                } else {
                    codeFile.replace(start, start + fileClass.length, className);
                }
            }
            fContinue(node.right);
        } else {
            fContinue(node);
        }
    });

    codeFile.append("\nmodule.exports = " + className + ";\n");
};
