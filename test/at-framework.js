var path = require('path');
var ns2cjs = require('../src/ns2cjs');
var grunt = require('grunt');
var read = function(src) {
    return grunt.util.normalizelf(grunt.file.read(src));
};
var glob = require("glob");

var compareFolders = function(test, assertedPath, actualPath) {

    var assertedPaths, actualPaths;

    function comparePathArrays(test, basePathOne, pathsOne, basePathTwo, pathsTwo, assertFunc) {
        for(var i = 0; i < pathsOne.length; i++) {
            var subPath = path.relative(basePathOne, pathsOne[i]);

            var pathTwo = path.join(basePathTwo, subPath);
            //console.log("looking for "+path.resolve(pathTwo));
            //console.log("found"+pathsTwo[0]);
            test.equal(true, pathsTwo.indexOf(pathTwo) >= 0);

            if (assertFunc) {
                assertFunc(pathsOne[i], pathTwo);
            }
        }
    }

    function doCompare() {
        comparePathArrays(test, assertedPath, assertedPaths, actualPath, actualPaths,
            function(assertedFilePath, actualFilePath) {
                test.equal(read(assertedFilePath), read(actualFilePath));
            });
        comparePathArrays(test, actualPath, actualPaths, assertedPath, assertedPaths);
        test.done();
    };

    glob(path.join(assertedPath, "**/*.js"), function(er, paths) {
        assertedPaths = paths.map(function(filePath) { return path.resolve(filePath); });
        if (actualPaths) {
            doCompare();
        }
    });
    glob(path.join(actualPath, "**/*.js"), function(er, paths) {
        actualPaths = paths.map(function(filePath) { return path.resolve(filePath); });
        if (assertedPaths) {
            doCompare();
        }
    });
};

module.exports = {
    scenario: function(test, name) {
        var outputPath = path.resolve('.tmp/inputfiles/'+name+'/'),
            pathToProcess = path.resolve('test/inputfiles/'+name+'/'),
            pathToAssert = path.resolve('test/assertedfiles/'+name+'/');

        ns2cjs.convert(pathToProcess, outputPath, function() {
            compareFolders(test, pathToAssert, outputPath);
        });
    }
};
