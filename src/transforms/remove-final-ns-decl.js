/**
 * @module ns2cjs/transforms/remove-final-ns-decl
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
		finalNsDecl = fileInfo.pattern.finalNsDecl;

	if (finalNsDecl) {
		codeFile.delete(finalNsDecl.range[0], finalNsDecl.range[1]);
	}
	if (!fileInfo.pattern.hasModuleExports) {
		codeFile.append(codeFile.newline + "module.exports = " + className + ";" + codeFile.newline);
	}
};
