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
function Transformer(files) {
    this._files = files;
    this._allClasses = [];
    this._log = [];
}

Transformer.prototype.run = function() {
    var transforms = require("./transforms"),
        filePatternAnalyser = require("./transforms/file-pattern-analyser");

    this._files.forEach(function(file) {
        file.ast = esprima.parse(file.contents, {
            range: true,
            comment: true
        });
        file.codeFile = new CodeFile(file.contents);
        this._allClasses.push(file.getFileClass());
        file.pattern = filePatternAnalyser.run(file, this);
    }.bind(this));

    this._files.forEach(function(file) {
        for(var i = 0; i < transforms.length; i++) {
            transforms[i].run(file, this);
        }
    }.bind(this));
};

Transformer.prototype.getModuleClasses = function() {
    return this._allClasses;
};

Transformer.prototype.getLibraries = function() {
    //TODO!
    return ["jQuery"];
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
