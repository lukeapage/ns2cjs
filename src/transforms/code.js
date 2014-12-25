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
    console.log("to string - node not recognised");
    console.log(node);
}

function isNodeAllMemberOrIdentifier(node) {
    if (node.type === "MemberExpression") {
        return isNodeAllMemberOrIdentifier(node.object) && isNodeAllMemberOrIdentifier(node.property);
    } else if (node.type === "Identifier" ) {
        return true;
    }
    return false;
}

function isLocal(scopes, identifier) {
    return scopes.some(function(scope) {
        if (scope.indexOf(identifier) >= 0) {
            return true;
        }
    });
}

function isGlobalRequired(globals, requireName) {
    return globals.some(function(global) {
        return global.requireName === requireName;
    });
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
        inFunction = 0,
        globals = [],
        scope = [];

    function replaceGlobal(node) {
        var fullText = astToString(node),
            isProperty = node.type === "MemberExpression",
            leftMostIndentifier = fullText.match(/^[^\.]+/i)[0];

        if (isLocal(scope, leftMostIndentifier)) {
            return;
        }

        if (!isProperty) {
            if (!isGlobalRequired(globals, fullText)) {
                globals.push({ varName: fullText, requireName: fullText });
            }
            return;
        }
    }

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=" &&
            inFunction === 0 &&
            isNodeAllMemberOrIdentifier(node.left)) {

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
            return;
        }

        if (node.type === "FunctionExpression") {
            inFunction++;
            scope.push([]);
            node.params.forEach(function(param) {
                if (typeof param.name !== "string") {
                    throw new Error("unrecognised parameter format");
                }
                scope[scope.length - 1].push(param.name);
            });
            fContinue(node.body);
            scope.pop();
            inFunction--;
            return;
        } else if (node.type === "MemberExpression") {
            if (isNodeAllMemberOrIdentifier(node)) {
                replaceGlobal(node);
                return;
            } else {
                // ignore the property - its not a variable
                fContinue(node.object);
                return;
            }
        } else if (node.type === "Identifier") {
            replaceGlobal(node);
            return;
        }
        fContinue(node);
    });

    if (globals.length) {
        var globalVar = "var ";
        for(var i = 0; i < globals.length; i++) {
            if (i !== 0) {
                globalVar += ",\n    ";
            }
            globalVar += globals[i].varName + " = require(\"" + globals[i].requireName + "\")";
        }
        globalVar += ";\n\n";
        codeFile.insert(0, globalVar);
    }

    codeFile.append("\nmodule.exports = " + className + ";\n");
};
