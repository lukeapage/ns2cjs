'use strict';

var Replacer = require("../src/replacer"),
    replacer,
    text;

function givenAReplacer() {
    replacer = new Replacer(text);
}

function withTheText(newText) {
    text = newText;
}

function thenTheOutputIs(test, assertedText) {
    test.equal(assertedText, replacer.toString());
}

exports.replacer = {
    untouched: function(test) {
        givenAReplacer(withTheText("test"));
        thenTheOutputIs(test, "test");
        test.done();
    }
};
