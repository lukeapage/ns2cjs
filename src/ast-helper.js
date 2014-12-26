/**
 *
 * @module ns2cjs/ast-helper
 */

/**
 * Converts node to a string. works only on identifiers and member expressions
 * @param node
 * @returns {String}
 */
var astToString = exports.astToString = function(node) {
    if (node.type === "MemberExpression") {
        return astToString(node.object) + "." + astToString(node.property);
    } else if (node.type === "Identifier" ) {
        return node.name;
    }
    console.log("to string - node not recognised");
    console.log(node);
};

/**
 * Returns if node is just identifiers and member expressions or contains something more complicated
 * @returns {Boolean}
 */
var isNodeAllMemberOrIdentifier = exports.isNodeAllMemberOrIdentifier = function(node) {
    if (node.type === "MemberExpression") {
        return isNodeAllMemberOrIdentifier(node.object) && isNodeAllMemberOrIdentifier(node.property);
    } else if (node.type === "Identifier" ) {
        return true;
    }
    return false;
};
