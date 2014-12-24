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
