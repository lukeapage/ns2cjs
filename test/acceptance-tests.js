'use strict';

var ATFramework = require("./at-framework");

exports.ats = {
    compile: function(test) {
        ATFramework.scenario(test, "simple");
    }
};
