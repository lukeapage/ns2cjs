'use strict';

var TransformInfo = require("../src/transform-info"),
    transformInfo,
    subPath;

function givenATransformInfo() {
    transformInfo = new TransformInfo(subPath);
}

function withTheSubPath(newSubPath) {
    subPath = newSubPath;
}

function thenTheClassIs(test, assertedClass) {
    test.equal(assertedClass, transformInfo.getFileClass());
}

exports.transforminfo = {
    class_unix_noleading: function(test) {
        givenATransformInfo(withTheSubPath("root/TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_unix_leading: function(test) {
        givenATransformInfo(withTheSubPath("/root/TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_win_noleading: function(test) {
        givenATransformInfo(withTheSubPath("root\\TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    },
    class_win_leading: function(test) {
        givenATransformInfo(withTheSubPath("\\root\\TestOne.js"));
        thenTheClassIs(test, "root.TestOne");
        test.done();
    }
};
