/**
 * @module ns2cjs/transforms/code
 */

var astTraverse = require("../ast-traverse"),
    astHelper = require("../ast-helper");

function isLocal(scopes, identifier) {
    if (identifier === "require") {
        return true;
    }
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
        inFunction = 0,
        globals = [],
        scope = [[]],
        firstFunctionHit = false,
        globalVarDeclarationContinuePosition;

    function replaceGlobal(node) {
        var fullText = astHelper.astToString(node),
            leftMostIndentifier = fullText.match(/^[^\.]+/i)[0];

        if (isLocal(scope, leftMostIndentifier)) {
            return;
        }

        var globalIdentifier = findGlobalIndentifier(fullText, transformer);
        if (!globalIdentifier) {
            transformer.warn(fileInfo, "Global identifier found with no matching module or library - " + fullText, node.range[0]);
            return;
        }

        //TODO is rightMostIdentifier unique?
        var rightMostIdentifier = globalIdentifier.match(/[^\.]+$/i)[0],
            requireName = globalIdentifier.replace(/\./g,"/");

        if (!isGlobalRegistered(globals, requireName)) {
            globals.push({ varName: rightMostIdentifier, requireName: requireName });
        }
        if (rightMostIdentifier !== globalIdentifier) {
            codeFile.replace(node.range[0], node.range[0] + globalIdentifier.length, rightMostIdentifier);
        }
    }

    astTraverse(ast, function(node, fContinue) {
        if (node === fileInfo.pattern.singletonAssignmentNode) {
            return; // skip node
        }
        if (node.type === "AssignmentExpression" && node.operator === "=" &&
            inFunction === 0 &&
            astHelper.isNodeAllMemberOrIdentifier(node.left)) {

            firstFunctionHit = true;
            fContinue(node.right);
            return;
        }

        if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
            if (node.type === "FunctionDeclaration" && node.id) {
                scope[scope.length - 1].push(node.id.name);
            }
            inFunction++;
            scope.push([]);
            node.params.forEach(function(param) {
                if (typeof param.name !== "string") {
                    transformer.warn(fileInfo, "unrecognised parameter format - " + param.type, param.range[0]);
                    return;
                }
                scope[scope.length - 1].push(param.name);
            });
            fContinue(node.body);
            scope.pop();
            inFunction--;
            return;
        } else if (node.type === "MemberExpression") {
            if (astHelper.isNodeAllMemberOrIdentifier(node)) {
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
        } else if (node.type === "VariableDeclaration" && inFunction === 0) {
            fContinue(node);
            if (!firstFunctionHit) {
                globalVarDeclarationContinuePosition = node.range[1] - 1;
            }
            return;
        }
        fContinue(node);
    });

    if (globals.length) {
        var globalVar;
        if (globalVarDeclarationContinuePosition) {
            globalVar = ",\n    ";
        } else {
            globalVar = "var ";
        }
        for(var i = 0; i < globals.length; i++) {
            if (i !== 0) {
                globalVar += ",\n    ";
            }
            globalVar += globals[i].varName + " = require(\"" + globals[i].requireName + "\")";
        }
        if (!globalVarDeclarationContinuePosition) {
            globalVar += ";\n\n";
        }
        codeFile.insert(globalVarDeclarationContinuePosition || 0, globalVar);
    }
};
