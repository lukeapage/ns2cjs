var path = require('path');
var fs = require('fs');
var ns2cjs = require('../src/ns2cjs');
var grunt = require('grunt');
var read = function(src) {
    return grunt.util.normalizelf(grunt.file.read(src));
};
var glob = require("glob");
var logHelper = require("../src/log-helper");

function stylize(str, style) {
    var styles = {
        'reset'     : [0,   0],
        'bold'      : [1,  22],
        'inverse'   : [7,  27],
        'underline' : [4,  24],
        'yellow'    : [33, 39],
        'green'     : [32, 39],
        'red'       : [31, 39],
        'grey'      : [90, 39]
    };
    return '\033[' + styles[style][0] + 'm' + str +
        '\033[' + styles[style][1] + 'm';
}

function diff(left, right) {
    require('diff').diffLines(left.replace(/\r/g, ""), right.replace(/\r/g, "")).forEach(function(item) {
        if(item.added || item.removed) {
            var text = item.value.replace("\n", String.fromCharCode(182) + "\n");
            process.stdout.write(stylize(text, item.added ? 'green' : 'red'));
        } else {
            process.stdout.write(item.value);
        }
    });
    process.stdout.write("\n");
}

var compareFolders = function(test, assertedPath, actualPath) {

    var assertedPaths, actualPaths;

    function comparePathArrays(test, basePathOne, pathsOne, basePathTwo, pathsTwo, assertFunc) {
        for(var i = 0; i < pathsOne.length; i++) {
            var subPath = path.relative(basePathOne, pathsOne[i]);

            var pathTwo = path.join(basePathTwo, subPath);
            test.equal(true, pathsTwo.indexOf(pathTwo) >= 0);

            if (assertFunc) {
                assertFunc(pathsOne[i], pathTwo);
            }
        }
    }

    function doCompare() {
        comparePathArrays(test, assertedPath, assertedPaths, actualPath, actualPaths,
            function(assertedFilePath, actualFilePath) {
                var assertedContent = read(assertedFilePath),
                    actualContent = read(actualFilePath);

                if (assertedContent != actualContent) {
                    console.log("");
                    diff(assertedContent, actualContent);
                }
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

function compareMessages(test, expected, actual) {
    actual = actual.slice(0);
    expected.forEach(function(expectedMsg) {
        var filename = expectedMsg.match(/^[^:]+/)[0],
            msg = expectedMsg.match(/:(.+)/)[1];
        for(var i = actual.length -1; i >= 0; i--) {
            if (actual[i].fileInfo.subPath === filename && actual[i].msg === msg) {
                test.equals(actual[i].msg, msg); //so we increase the assertions with each new test
                actual.splice(i, 1);
                return;
            }
        }
        test.equals("", expectedMsg, "Log message not present");
    });
    actual.forEach(function(actualMsg) {
        test.equals(actualMsg.fileInfo.subPath + ":" + actualMsg.msg, "", "Log message not expected");
    });
};

module.exports = {
    scenario: function(test, name, expectedWarnings) {
        var outputPath = path.resolve('.tmp/inputfiles/'+name+'/'),
            pathToProcess = path.resolve('test/inputfiles/'+name+'/'),
            pathToAssert = path.resolve('test/assertedfiles/'+name+'/');

        ns2cjs.convert(pathToProcess, outputPath, function(logMessages) {
            test.equals(0, logHelper.errors(logMessages).length, "No errors");
            compareMessages(test, expectedWarnings || [], logHelper.warnings(logMessages));
            if (fs.existsSync(pathToAssert)) {
                compareFolders(test, pathToAssert, outputPath);
            } else {
                test.done();
            }
        });
    }
};
