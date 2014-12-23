'use strict';

var CodeFile = require("../src/code-file"),
    codeFile,
    text;

function givenACodeFile() {
    codeFile = new CodeFile(text);
}

function withTheText(newText) {
    text = newText;
}

function thenTheOutputIs(test, assertedText) {
    test.equal(assertedText, codeFile.toString());
}

exports.replacer = {
    untouched: function(test) {
        givenACodeFile(withTheText("test"));
        thenTheOutputIs(test, "test");
        test.done();
    }
};
