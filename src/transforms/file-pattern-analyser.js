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
                transformer.warn(fileInfo, "non simple assignment in root scope", node.range[0]);
            } else {
                var leftSide = astHelper.astToString(node.left);
                if (leftSide.indexOf(fileClass) === 0) {
                    if (leftSide === fileClass) {
                        if (declaredFunc) {
                            //TODO check if right hand side is delcaredFunc
                            transformer.warn(fileInfo, "Overwriting class definition. not with named function", node.range[0]);
                        }
                        if (fullNSAssignment) {
                            // could be singleton
                            //TODO
                            if (node.right.type = "NewThingy") {

                            }else {
                                console.dir(node.right);
                                transformer.warn(fileInfo, "Multiple assignment to class", node.range[0]);
                            }
                        }
                        fullNSAssignment = true;
                    } else {
                        if (declaredFunc) {
                            transformer.warn(fileInfo, "Assignment to class sub when declared function exists", node.range[0]);
                        }
                        if (leftSide.indexOf(fileClass + ".prototype")) {
                            assignmentToPrototype = true;
                        } else {
                            assignmentToFunc = true;
                        }
                    }
                } else if (leftSide.indexOf(declaredFunc) === 0) {
                    if (leftSide === declaredFunc) {
                        //TODO check if right hand side is delcaredFunc
                        transformer.warn(fileInfo, "Overwriting a declared function", node.range[0]);
                    } else {
                        if (leftSide.indexOf(declaredFunc + ".prototype")) {
                            assignmentToPrototype = true;
                        } else {
                            assignmentToFunc = true;
                        }
                    }
                } else {
                    transformer.warn(fileInfo, "Unrecognised assignment", node.range[0]);
                }
                fContinue(node.right);
                return;
            }
        }

        if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
            if (node.type === "FunctionDeclaration" && node.id && inFunction === 0) {
                if (declaredFunc) {
                    transformer.warn(fileInfo, "Multiple declared functions - ignoring", node.range[0]);
                } else if (fullNSAssignment) {
                    transformer.warn(fileInfo, "Declared function after class assignment - ignoring", node.range[0]);
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

    if (!fullNSAssignment) {
        transformer.warn(fileInfo, "class never assigned in file", 0);
    }

    return {};
};
