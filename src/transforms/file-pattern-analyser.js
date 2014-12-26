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
        declaredFunc,
        singletonAssignmentNode,
        hasModuleExports,
        hasExports,
        constructorNode,
        constructorAssignment;

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
                            // TODO check singleton?
                            if (!(node.right.type === "Identifier" && node.right.name === declaredFunc)) {
                                transformer.warn(fileInfo, "Overwriting class definition. not with named function", node.range[0]);
                            }
                        }
                        if (fullNSAssignment) {
                            if (node.right.type == "NewExpression" &&
                                astHelper.isNodeAllMemberOrIdentifier(node.right.callee) &&
                                astHelper.astToString(node.right.callee) === fileClass) {

                                if (node.right.arguments.length > 0) {
                                    transformer.warn(fileInfo, "arguments to singleton assignment, not supported", node.range[0]);
                                }

                                if (singletonAssignmentNode) {
                                    transformer.warn(fileInfo, "Multiple singleton assignment", node.range[0]);
                                }
                                singletonAssignmentNode = node;

                            }else {
                                transformer.warn(fileInfo, "Multiple assignment to class", node.range[0]);
                            }
                        } else {
                            constructorNode = node.right;
                            constructorAssignment = node;
                            fullNSAssignment = true;
                        }
                    } else {
                        if (declaredFunc) {
                            transformer.warn(fileInfo, "Assignment to class sub when declared function exists", node.range[0]);
                        }
                        if (leftSide.indexOf(fileClass + ".prototype") >= 0) {
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
                } else if (leftSide === "module.exports") {
                    hasModuleExports = true;
                    if (!(declaredFunc && node.right.type == "Identifier" &&
                        node.right.name === declaredFunc)) {
                        transformer.warn(fileInfo, "unrecognised pre-existing module.exports", node.range[0]);
                    }
                } else if (leftSide === "exports") {
                    transformer.warn(fileInfo, "file is already using exports", node.range[0]);
                    hasExports = true;
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
                    constructorNode = node;
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

    var findGlobals = require("./find-globals"),
        jsDoc = require("./jsdoc"),
        jsDocReferences = require("./jsdoc-references"),
        nstocjs = require("./nstocjs"),
        nsStatic = require("./ns-static"),
        transforms = [findGlobals, jsDocReferences],
        patternInfo = {
            transforms: transforms
        };

    if (singletonAssignmentNode) {
        if (!constructorNode) {
            transformer.warn(fileInfo, "singleton assignment but no constructor found", 0);
        } else if (constructorNode.body.length > 0) {
            transformer.warn(fileInfo, "singleton assignment but constructor body has content", 0);
        }
        if (declaredFunc) {
            transformer.warn(fileInfo, "declared function not supported with singleton", 0);
        }
        if (assignmentToFunc) {
            transformer.warn(fileInfo, "unsupported assignment to non prototype with singleton", 0);
        } else if (!assignmentToPrototype) {
            transformer.warn(fileInfo, "empty singleton - no assignments to prototype", 0);
        }
        patternInfo.singletonAssignmentNode = singletonAssignmentNode;
        patternInfo.constructorNode = constructorAssignment || constructorNode;
        transforms.splice(0, 0, nsStatic);
    } else {
        transforms.splice(0, 0, nstocjs, jsDoc);
    }

    return patternInfo;
};
