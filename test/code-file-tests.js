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

function whenReplacing(start, end, text) {
    codeFile.replace(start, end, text);
}

function whenDeleting(start, end) {
    codeFile.delete(start, end);
}

function whenInserting(start, text) {
    codeFile.insert(start, text);
}

function whenAppending(text) {
    codeFile.append(text);
}

function thenTheOutputIs(test, assertedText) {
    test.equal(assertedText, codeFile.toString());
}

exports.codefile = {
    simple: function(test) {
        givenACodeFile(withTheText("test"));
        thenTheOutputIs(test, "test\n");
        test.done();
    },
    replacing: function(test) {
        givenACodeFile(withTheText("test"));
        whenReplacing(0, 1, "w");
        thenTheOutputIs(test, "west\n");
        test.done();
    },
    inserting: function(test) {
        givenACodeFile(withTheText("test"));
        whenInserting(0, "_");
        thenTheOutputIs(test, "_test\n");
        test.done();
    },
    deleting: function(test) {
        givenACodeFile(withTheText("test"));
        whenDeleting(1, 2);
        thenTheOutputIs(test, "tst\n");
        test.done();
    },
    appending: function(test) {
        givenACodeFile(withTheText("test"));
        whenAppending("ing");
        thenTheOutputIs(test, "testing\n");
        test.done();
    },
    insertingAndReplacingSamePlace: function(test) {
        givenACodeFile(withTheText("test"));
        whenReplacing(0, 1, "");
        whenInserting(0, "w");
        thenTheOutputIs(test, "west\n");
        test.done();
    },
    insertingAndReplacingSamePlaceReversed: function(test) {
        givenACodeFile(withTheText("test"));
        whenInserting(0, "w");
        whenReplacing(0, 1, "");
        thenTheOutputIs(test, "west\n");
        test.done();
    },
    everything: function(test) {
        givenACodeFile(withTheText("testy"));
        whenInserting(0, "w");
        whenReplacing(0, 1, "");
        whenAppending(" of here");
        whenDeleting(4, 5);
        thenTheOutputIs(test, "west of here\n");
        test.done();
    }

};
