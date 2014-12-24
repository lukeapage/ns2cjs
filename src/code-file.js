function CodeFile(input) {
    this._input = input;
    this._replacements = [];
}

CodeFile.prototype.replace = function(start, end, replacement) {
    this._replacements.push({start: start, end: end, value: replacement});
};

CodeFile.prototype.delete = function(start, end) {
    this.replace(start, end, "");
};

CodeFile.prototype.insert = function(start, insertion) {
    this.replace(start, start, insertion);
};

CodeFile.prototype.toString = function() {
    var transformed = this._input;
    // order reverse so inserts do not conflict
    this._replacements.sort(function(a, b) {
        return a.start < b.start ? 1 : -1;
    }).forEach(function(replacement) {
            var before = transformed.slice(0, replacement.start),
                after = transformed.slice(replacement.end, transformed.length);
            transformed = before + replacement.value + after;
        });
    return transformed;
};

module.exports = CodeFile;
