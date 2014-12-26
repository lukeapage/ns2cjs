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

function isGlobalRegistered(globals, requireName) {
    return globals.some(function(global) {
        return global.requireName === requireName;
    });
}

/**
 * Given a full identifier e.g. root.space.class.GLOBAL find root.space.class
 * @param {string} fullIdentifier
 * @param {module:ns2cjs/transformer} transformer
 */
function findGlobalIndentifier(fullIdentifier, transformer) {
    var identifier;
    [].concat(
    transformer.getModuleClasses())
        .concat(transformer.getLibraries())
        .forEach(function(moduleClass) {
            if (fullIdentifier === moduleClass || (fullIdentifier.indexOf(moduleClass+".") >= 0 && (!identifier || identifier.length < moduleClass.length))) {
                identifier = moduleClass;
            }
        });
    return identifier;
}

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
        globals = [],
        scope = [];

    function replaceGlobal(node) {
        var fullText = astToString(node),
            leftMostIndentifier = fullText.match(/^[^\.]+/i)[0];

        if (isLocal(scope, leftMostIndentifier)) {
            return;
        }

        var globalIdentifier = findGlobalIndentifier(fullText, transformer);
        if (!globalIdentifier) {
            // warn!
            return;
        }

        //TODO is rightMostIdentifier unique?
        var rightMostIdentifier = globalIdentifier.match(/[^\.]+$/i)[0],
            requireName = globalIdentifier.replace(/\./g,"/");

        if (!isGlobalRegistered(globals, requireName)) {
            // todo requirename is camel case?
            globals.push({ varName: rightMostIdentifier, requireName: requireName });
        }
        if (rightMostIdentifier !== globalIdentifier) {
            codeFile.replace(node.range[0], node.range[0] + globalIdentifier.length, rightMostIdentifier);
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
                    if (node.right.id) {
                        // warn node.right.id.name - function already named
                    }
                    codeFile.delete(start, node.right.range[0]);
                    codeFile.insert(node.right.range[0] + "function".length, " " + className);

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
        } else if (node.type === "VariableDeclarator") {
            scope[scope.length - 1].push(node.id.name);
            if (node.init) {
                fContinue(node.init);
            }
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
