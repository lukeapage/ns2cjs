/**
 *
 * @module ns2cjs/log-helper
 */

exports.warnings = function(logMessages) {
    return logMessages.filter(function(msg) {
        return msg.type === "warning";
    });
};

exports.errors = function(logMessages) {
    return logMessages.filter(function(msg) {
        return msg.type === "error";
    });
};

exports.formatLogMessage = function(logMessage) {
    var output = "in : " + logMessage.fileInfo.subPath + "\n";
    output += logMessage.msg + "\n";
    return output;
};
