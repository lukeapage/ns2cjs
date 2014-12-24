function Transformer(codeFile, transformInfo, ast) {
    this._codeFile = codeFile;
    this._transformInfo = transformInfo;
    this._ast = ast;
}

Transformer.prototype.run = function(transforms) {
    if (!transforms) {
        transforms = require("./transforms");
    }
    for(var i = 0; i < transforms.length; i++) {
        transforms[i].run(this._codeFile, this._transformInfo, this._ast);
    }
};

module.exports = Transformer;
