/**
 * @module ns2cjs/transforms/ns-static
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
        inFunction = 0,
        singletonAssignmentNode = fileInfo.pattern.singletonAssignmentNode,
        constructorNode = fileInfo.pattern.constructorNode;

    codeFile.delete(singletonAssignmentNode.range[0],singletonAssignmentNode.range[1]);
    if (constructorNode) {
        codeFile.delete(constructorNode.range[0], constructorNode.range[1]);
    }

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=" &&
            inFunction === 0 &&
            astHelper.isNodeAllMemberOrIdentifier(node.left)) {

            var leftSide = astHelper.astToString(node.left);
            if (leftSide.indexOf(fileClass+".prototype") === 0) {
                var start = node.left.range[0],
                    end = start + (fileClass+".prototype").length;
                codeFile.replace(start, end, "exports");
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
};
