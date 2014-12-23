function CodeFile(input) {
    this._input = input;
    this._replacements = [];
}

CodeFile.prototype.replace = function(start, end, replacement) {
};

CodeFile.prototype.toString = function() {
    var transformed = this._input;
    return transformed;
};

module.exports = CodeFile;
