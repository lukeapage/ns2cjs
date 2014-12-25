/**
 * @module ns2cjs/transform-info
 */

/**
 * @alias module:ns2cjs/transform-info
 * Holds information about the proposed transformation, common to all transforms
 * @param {string} subPath
 * @param {string[]} moduleNamespaces
 * @constructor
 */
function TransformInfo(subPath, moduleNamespaces) {
    this._subPath = subPath;
    this._moduleNamespaces = moduleNamespaces || [];
}

TransformInfo.prototype.getFileClass = function() {
    if (!this._fileClass) {
        this._fileClass = this._subPath.replace(/[\\\/]/g, ".")
            .replace(/(^\.)|(\.js$)/g, "");
    }
    return this._fileClass;
};

TransformInfo.prototype.getModulesNamespaces = function() {
    return this._moduleNamespaces;
};

module.exports = TransformInfo;
