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
        globals = [];

    function replaceGlobal(node) {
        var fullText = astToString(node),
            isProperty = node.type === "MemberExpression";

        if (!isProperty) {
            globals.push({ varName: fullText, requireName: fullText });
        }
    }

    astTraverse(ast, function(node, fContinue) {
        if (node.type === "AssignmentExpression" && node.operator === "=" && isNodeAllMemberOrIdentifier(node.left)) {
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
            // ignore params?
            fContinue(node.body);
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
