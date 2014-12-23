var esprima = require("esprima"),
    glob = require("glob"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    Replacer = require("./replacer");

var ensureDirectory = function (filepath, cb) {
    var dir = path.dirname(filepath);
    mkdirp(dir, cb);
};

module.exports = {
    convert: function(inputpath, outputpath, finished) {
        glob(path.join(inputpath, "**/*.js"), function(e, paths) {
            var processed = 0;
            paths.forEach(function(filepath) {
                var subPath = path.relative(inputpath, filepath);
                var inputFile = fs.readFileSync(filepath, 'utf8');
                /* var ast = */esprima.parse(inputFile, {
                    loc: true,
                    range: true,
                    comment: true
                });
                var outputFile = new Replacer(inputFile);
                var outputFilePath = path.join(outputpath, subPath);
                ensureDirectory(outputFilePath, function() {
                    fs.writeFile(outputFilePath, outputFile.toString(), 'utf8', function() {
                        processed++;
                        if (processed === paths.length) {
                            finished();
                        }
                    });
                });
            });
        });
    }
};
