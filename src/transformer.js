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
}

Transformer.prototype.run = function() {
    var transforms = require("./transforms");

    this._files.forEach(function(file) {
        file.ast = esprima.parse(file.contents, {
            range: true,
            comment: true
        });
        file.codeFile = new CodeFile(file.contents);
        this._allClasses.push(file.getFileClass());
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

module.exports = Transformer;
