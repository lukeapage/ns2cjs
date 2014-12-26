/**
 * @module ns2cjs/transforms/file-pattern-analyser
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
        fileClass = fileInfo.getFileClass(),
        fileClassSplit = fileClass.split("."),
        className = fileClassSplit[fileClassSplit.length - 1],
        inFunction = 0,
        fullNSAssignment,
        assignmentToPrototype,
        assignmentToFunc,
        declaredFunc;

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=" &&
            inFunction === 0) {

            if (!astHelper.isNodeAllMemberOrIdentifier(node.left)) {
                // warn
            } else {
                var leftSide = astHelper.astToString(node.left),
                    currentAssignment = declaredFunc || fileClass;
                if (leftSide.indexOf(currentAssignment) === 0) {
                    if (leftSide === currentAssignment) {
                        if (declaredFunc) {
                            // warn
                        }
                        if (fullNSAssignment) {
                            // could be singleton
                            if (node.right.type = "NewThingy") {

                            }else {
                                // warn
                            }
                        }
                        fullNSAssignment = true;
                    } else {
                        if (leftSide.indexOf(currentAssignment + ".prototype")) {
                            assignmentToPrototype = true;
                        } else {
                            assignmentToFunc = true;
                        }
                    }
                } else {
                    // warn
                }
                fContinue(node.right);
                return;
            }
        }

        if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
            if (node.type === "FunctionDeclaration" && node.id) {
                if (declaredFunc) {
                    // warn multiple declared functions - ignoring
                } else {
                    declaredFunc = node.id.name;
                }
            }
            inFunction++;
            fContinue(node.body);
            inFunction--;
            return;
        }
        fContinue(node);
    });

    return {};
};
