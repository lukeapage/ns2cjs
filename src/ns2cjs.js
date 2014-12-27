var glob = require("glob"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    FileInfo = require("./file-info"),
    Transformer = require("./transformer");

var ensureDirectory = function (filepath, cb) {
    var dir = path.dirname(filepath);
    mkdirp(dir, cb);
};

module.exports = {
    convert: function(inputpath, outputpath, finished, options) {
        options = options || {};
        glob(path.join(inputpath, "**/*.js"), function(e, paths) {
            var files = [];
            paths.forEach(function(filepath) {
                var subPath = path.relative(inputpath, filepath);
                fs.readFile(filepath, 'utf8', function(err, inputFile) {
                    var fileInfo = new FileInfo(filepath, subPath, inputFile);
                    files.push(fileInfo);
                    if (files.length === paths.length) {
                        // set timeout to allow filehandle to close
                        setTimeout(onAllFilesRead.bind(null, files), 0);
                    }
                });
            });
        });

        function onAllFilesRead(files) {
            var processed = 0;
            var transformer = new Transformer(files, options);
            transformer.run();

            if (options.dryRun) {
                finished(transformer.getLog());
            } else {
                files.forEach(function(file) {
                    var outputFilePath = path.join(outputpath, file.subPath);
                    ensureDirectory(outputFilePath, function() {
                        fs.writeFile(outputFilePath, file.codeFile.toString(), 'utf8', function() {
                            processed++;
                            if (processed === files.length) {
                                finished(transformer.getLog());
                            }
                        });
                    });
                });
            }
        }
    }
};
