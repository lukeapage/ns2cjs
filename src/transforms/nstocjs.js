/**
 * @module ns2cjs/transforms/nstocjs
 */

var astTraverse = require("../ast-traverse"),
    astHelper = require("../ast-helper");

/**
 * Runs this transform
 * @param {module:ns2cjs/file-info} fileInfo
 * @param {module:ns2cjs/transformer} transformer
 */
exports.run = function(fileInfo, transformer) {

    var ast = fileInfo.ast,
        codeFile = fileInfo.codeFile,
        fileClass = fileInfo.getFileClass(),
        fileClassSplit = fileClass.split("."),
        className = fileClassSplit[fileClassSplit.length - 1],
        inFunction = 0;

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=" &&
            inFunction === 0 &&
            astHelper.isNodeAllMemberOrIdentifier(node.left)) {

            var leftSide = astHelper.astToString(node.left);
            if (leftSide.indexOf(fileClass) === 0) {
                var start = node.left.range[0];
                if (leftSide === fileClass) {
                    // constructor assignment
                    codeFile.delete(start, node.right.range[0]);

                    if (node.right.id) {
                        transformer.warn(fileInfo, "Function already named (" + node.right.id.name +"), not changing to " + className, node.right.range[0]);
                    } else {
                        codeFile.insert(node.right.range[0] + "function".length, " " + className);
                    }

                    var lastCharPosition = node.right.range[1];
                    if (codeFile.charAt(lastCharPosition) === ";") {
                        codeFile.delete(lastCharPosition, lastCharPosition + 1);
                    } else {
                        // info - was missing semi-colon
                    }
                } else {
                    codeFile.replace(start, start + fileClass.length, className);
                }
            }
            fContinue(node.right);
            return;
        }

        if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
            inFunction++;
            fContinue(node.body);
            inFunction--;
            return;
        }
        fContinue(node);
    });

	if (!fileInfo.pattern.hasModuleExports) {
        codeFile.append(codeFile.newline + "module.exports = " + className + ";" + codeFile.newline);
	}
};
