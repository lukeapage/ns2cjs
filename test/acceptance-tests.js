'use strict';

var ATFramework = require("./at-framework");

exports.ats = {
    simple: function(test) {
        ATFramework.scenario(test, "simple");
    },
    warnings: function(test) {
        ATFramework.scenario(test, "warnings", [
            "root\\IncorrectModuleDeclaration1.js:module comment does not match expected - root/ncorrectModuleDeclaration1 != root/IncorrectModuleDeclaration1",
            "root\\IncorrectModuleDeclaration2.js:module comment found with non understandable identifier",
            "root\\IncorrectModuleDeclaration3.js:module comment does not match expected - root/ncorrectModuleDeclaration3 != root/IncorrectModuleDeclaration3",
            "root\\IncorrectModuleDeclaration3.js:module comment does not match expected - root/ncorrectModuleDeclaration3 != root/IncorrectModuleDeclaration3",
            "root\\IncorrectModuleDeclaration3.js:Multiple module comments found in file to convert",
            "root\\IncorrectModuleDeclaration3.js:Multiple module comments found in file to convert"
        ]);
    }
};
