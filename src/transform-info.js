/**
 * @module ns2cjs/transform-info
 */

/**
 * @alias module:ns2cjs/transform-info
 * Holds information about the proposed transformation, common to all transforms
 * @param {string} subPath
 * @param {string[]} topLevelNamespaces
 * @constructor
 */
function TransformInfo(subPath, topLevelNamespaces) {
    this._subPath = subPath;
    this._topLevelNamespaces = topLevelNamespaces || [];
}

TransformInfo.prototype.getFileClass = function() {
    if (!this._fileClass) {
        this._fileClass = this._subPath.replace(/[\\\/]/g, ".")
            .replace(/(^\.)|(\.js$)/g, "");
    }
    return this._fileClass;
};

TransformInfo.prototype.getTopLevelNamespaces = function() {
    return this._topLevelNamespaces;
};

module.exports = TransformInfo;
