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

function getLineInfo(index, fileInfo) {
	var contents = fileInfo.contents,
		n = index + 1,
		line,
		column = -1;

	while (--n >= 0 && contents.charAt(n) !== '\n') {
		column++;
	}

	line = (contents.slice(0, index).match(/\n/g) || "").length;

	return {
		line: line,
		column: column
	};
}

exports.formatLogMessage = function(logMessage) {
    var output = "in : " + logMessage.fileInfo.subPath + "\n";
    output += logMessage.msg + "\n";
	if (logMessage.loc > 0) {
		var lineInfo = getLineInfo(logMessage.loc, logMessage.fileInfo);
		output += " at "+lineInfo.line + ":" + lineInfo.column + "\n";
		output += logMessage.fileInfo.contents.split("\n")[lineInfo.line] + "\n";
	}
    return output;
};
