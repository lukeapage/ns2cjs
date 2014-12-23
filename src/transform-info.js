function TransformInfo(subPath) {
    this._subPath = subPath;
}

TransformInfo.prototype.getFileClass = function() {
    if (!this._fileClass) {
        this._fileClass = this._subPath.replace(/[\\\/]/g, ".")
            .replace(/(^\.)|(\.js$)/g, "");
    }
    return this._fileClass;
};

module.exports = TransformInfo;
