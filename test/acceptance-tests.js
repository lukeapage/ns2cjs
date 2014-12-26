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
            "root\\IncorrectModuleDeclaration3.js:Multiple module comments found in file to convert",
            "root\\GlobalIdNotFound.js:Global identifier found with no matching module or library - _.underscore",
            "root\\MultipleDeclared.js:Multiple declared functions - ignoring",
            "root\\MultipleDeclared.js:class never assigned in file",
            "root\\DeclaredAfterClass.js:Declared function after class assignment - ignoring",
            "root\\ClassAlreadyHasName.js:Function already named (named), not changing to ClassAlreadyHasName",
            "root\\UnrecognisedAssignment.js:Unrecognised assignment"
        ]);
    }
};
