/**
 * @module ns2cjs/file-info
 */

/**
 * @alias module:ns2cjs/file-info
 * Holds information about the file
 * @param {string} fullpath
 * @param {string} subPath
 * @param {string} contents
 * @constructor
 */
function FileInfo(fullpath, subPath, contents) {
    this.fullpath = fullpath;
    this.subPath = subPath;
    this.contents = contents;
}

FileInfo.prototype.getFileClass = function() {
    if (!this._fileClass) {
        this._fileClass = this.subPath.replace(/[\\\/]/g, ".")
            .replace(/(^\.)|(\.js$)/g, "");
    }
    return this._fileClass;
};

module.exports = FileInfo;
