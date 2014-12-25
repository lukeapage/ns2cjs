/**
 * @module ns2cjs/ast-traverse
 */

/**
 * Traverses a esprima ast and calls visitor on every node
 * @alias module:ns2cjs/ast-traverse
 * @param {object} ast
 * @param {function} visitor
 */
function astTraverse(entryAst, visitor) {
    visitor.call(null, entryAst, function(ast) {
        if (ast !== entryAst) {
            astTraverse(ast, visitor);
            return;
        }
        Object.keys(ast)
            .forEach(function(key) {
                var value = ast[key];
                if (typeof value === 'object' && value !== null) {
                    astTraverse(value, visitor);
                }
            });
    });
}

module.exports = astTraverse;
