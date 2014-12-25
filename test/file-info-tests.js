'use strict';

var FileInfo = require("../src/file-info"),
    fileInfo,
    subPath;

function givenAFileInfo() {
    fileInfo = new FileInfo("", subPath, "");
}

function withTheSubPath(newSubPath) {
    subPath = newSubPath;
}

function thenTheClassIs(test, assertedClass) {
    test.equal(assertedClass, fileInfo.getFileClass());
}

exports.transforminfo = {
    class_unix_noleading: function(test) {
        givenAFileInfo(withTheSubPath("root/TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_unix_leading: function(test) {
        givenAFileInfo(withTheSubPath("/root/TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_win_noleading: function(test) {
        givenAFileInfo(withTheSubPath("root\\TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_win_leading: function(test) {
        givenAFileInfo(withTheSubPath("\\root\\TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    }
};
