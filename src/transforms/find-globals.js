/**
 * @module ns2cjs/transforms/code
 */

var astTraverse = require("../ast-traverse"),
    astHelper = require("../ast-helper"),
    globallyDefined = ["require", "isNaN", "parseInt", "window", "document", "arguments",
        "Array", "Object", "RegExp", "Date", "Number", "undefined", "Function", "String",
        "isFinite", "Error", "String", "module", "exports", "parseFloat"];

function isGlobalRegistered(globals, requireName) {
	var globalReference = null;
    globals.some(function(global) {
	    var isMatch = global.requireName === requireName;
        if (isMatch) {
	        globalReference = global;
        }
	    return isMatch;
    });
	return globalReference;
}

function isLocal(scopes, transformer, identifier) {
	if (globallyDefined.indexOf(identifier) >= 0) {
		return true;
	}
	if (transformer.getIgnoredGlobals().indexOf(identifier) >= 0) {
		return true;
	}
	return scopes.some(function(scope) {
		if (scope.indexOf(identifier) >= 0) {
			return true;
		}
	});
}

/**
 * Given a full identifier e.g. root.space.class.GLOBAL find root.space.class
 * @param {string} fullIdentifier
 * @param {module:ns2cjs/transformer} transformer
 */
function findGlobalIndentifier(fullIdentifier, transformer) {
    var identifier;
    transformer.getLibraries()
        .forEach(function(library) {
            if (fullIdentifier === library.id || (fullIdentifier.indexOf(library.id + ".") >= 0)) {
                identifier = library;
            }
        });
    if (identifier) {
        return identifier;
    }
    transformer.getModuleClasses()
        .forEach(function(moduleClass) {
            if (fullIdentifier === moduleClass || (fullIdentifier.indexOf(moduleClass+".") >= 0 && (!identifier || identifier.length < moduleClass.length))) {
                identifier = { id: moduleClass, require: moduleClass.replace(/\./g, "/")};
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
        globals = (fileInfo.pattern.extraGlobals || []).slice(0),
        scope = [[]],
        firstFunctionHit = false,
        globalVarDeclarationContinuePosition;

    function replaceGlobal(node) {
        var fullText = astHelper.astToString(node),
            leftMostIndentifier = fullText.match(/^[^\.]+/i)[0];

        if (isLocal(scope, transformer, leftMostIndentifier)) {
            return;
        }
	    
	    if (fullText === fileInfo.getFileClass() && fileInfo.pattern.type === "NamespacedClass") {
		    return;
	    }

        var globalIdentifier = findGlobalIndentifier(fullText, transformer);
        if (!globalIdentifier) {
            transformer.warn(fileInfo, "Global identifier found with no matching module or library - " + fullText, node.range[0]);
            return;
        }

        //TODO is rightMostIdentifier unique?
        var requireName = globalIdentifier.require,
	        alreadyRegistered = isGlobalRegistered(globals, requireName)
	        localIdentifier = alreadyRegistered ? alreadyRegistered.varName : (globalIdentifier.localId || globalIdentifier.id.match(/[^\.]+$/i)[0]);

        if (!alreadyRegistered) {
            globals.push({ varName: localIdentifier, requireName: requireName });
        }
        if (localIdentifier !== globalIdentifier.id) {
            codeFile.replace(node.range[0], node.range[0] + globalIdentifier.id.length, localIdentifier);
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
            // ignore jsdon property identifiers
        } else if (node.type === "Property" && node.key.type === "Identifier") {
            fContinue(node.value);
            return;
        } else if (node.type === "Identifier") {
            replaceGlobal(node);
            return;
        } else if (node.type === "CatchClause") {
            scope[scope.length - 1].push(node.param.name);
            fContinue(node.body);
            scope[scope.length - 1].splice(scope[scope.length - 1].indexOf(node.param.name), 1);
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
	
	globals = globals.filter(function(global) {
		return !global.doNotRequire;
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
