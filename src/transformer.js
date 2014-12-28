/**
 * @module ns2cjs/transformer
 */

var esprima = require("esprima"),
    CodeFile = require("./code-file");

/**
 * @alias module:ns2cjs/transformer
 * Performs a set of transforms
 * @param {module:ns2cjs/file-info[]} files
 * @constructor
 */
function Transformer(files, options) {
    this._files = files;
    this._allClasses = [];
    this._log = [];
    this._libraries = options.libraries || [];
	this._ignoredGlobals = options.ignoredGlobals || [];
	this._referencedFiles = options.referencedFiles || [];
}

Transformer.prototype.run = function() {
    var filePatternAnalyser = require("./transforms/file-pattern-analyser"),
        transformer = this;

	this._referencedFiles.forEach(function(referencedFile) {
		transformer._allClasses.push(referencedFile.getFileClass());
	});

    this._files.forEach(function(file) {
        file.ast = esprima.parse(file.contents, {
            range: true,
            comment: true
        });
        file.codeFile = new CodeFile(file.contents);
        transformer._allClasses.push(file.getFileClass());
        file.pattern = filePatternAnalyser.run(file, transformer);
    });

    this._files.forEach(function(file) {
        file.pattern.transforms.forEach(
            function(transform) {
                transform.run(file, transformer);
            });
    });
};

Transformer.prototype.getModuleClasses = function() {
    return this._allClasses;
};

Transformer.prototype.getLibraries = function() {
    return this._libraries;
};

Transformer.prototype.getIgnoredGlobals = function() {
	return this._ignoredGlobals;
};

Transformer.prototype.info = function(fileInfo, msg, loc) {
    this.log("info", fileInfo, msg, loc);
};

Transformer.prototype.warn = function(fileInfo, msg, loc) {
    this.log("warning", fileInfo, msg, loc);
};

Transformer.prototype.error = function(fileInfo, msg, loc) {
    this.log("error", fileInfo, msg, loc);
};

Transformer.prototype.log = function(type, fileInfo, msg, loc) {
    if (!fileInfo) {
        throw new Error("log message missing file info");
    }
    this._log.push({
        type: type,
        fileInfo: fileInfo,
        msg: msg,
        loc: loc
    });
};

Transformer.prototype.getLog = function() {
    return this._log;
};

module.exports = Transformer;
