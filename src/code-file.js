/**
 * @module ns2cjs/code-file
 */

/**
 * Constructs a code file, which stores the modifications required and outputs the modified version
 * when you call toString.
 * @alias CodeFile
 * @param input
 * @constructor
 */
function CodeFile(input) {
    this._input = input;
    this._replacements = [];
}

/**
 * Replaces a string with another
 * @param start
 * @param end
 * @param replacement
 */
CodeFile.prototype.replace = function(start, end, replacement) {
    this._replacements.push({start: start, end: end, value: replacement});
};

/**
 * deletes a string
 * @param start
 * @param end
 */
CodeFile.prototype.delete = function(start, end) {
    this.replace(start, end, "");
};

/**
 * inserts a string
 * @param start
 * @param insertion
 */
CodeFile.prototype.insert = function(start, insertion) {
    this.replace(start, start, insertion);
};

/**
 *
 * @param appendage
 */
CodeFile.prototype.append = function(appendage) {
    this.replace(this._input.length, this._input.length, appendage);
};

/**
 * Gets the char at in the original file
 * @param index
 */
CodeFile.prototype.charAt = function(index) {
    return this._input.charAt(index);
};

/**
 * creates the transformed code file source
 * @returns {String}
 */
CodeFile.prototype.toString = function() {
    var transformed = this._input;
    // order reverse so inserts do not conflict
    this._replacements.sort(function(a, b) {
        if (a.start === b.start) {
            if (a.start === a.end) {
                return 1;
            }
            if (b.start === b.end) {
                return -1;
            }
            throw new Error("Unexpected multiple replace in the same place");
        }
        return a.start < b.start ? 1 : -1;
    }).forEach(function(replacement) {
            var before = transformed.slice(0, replacement.start),
                after = transformed.slice(replacement.end, transformed.length);
            transformed = before + replacement.value + after;
        });
    return transformed;
};

module.exports = CodeFile;
