function Replacer(input) {
    this._input = input;
    this._replacements = [];
}

Replacer.prototype.replace = function(start, end, replacement) {
};

Replacer.prototype.toString = function() {
    var transformed = this._input;
    return transformed;
};

module.exports = Replacer;
