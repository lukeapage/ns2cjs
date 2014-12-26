/**
 * @module root/Comments
 */

/**
 * This is a comments class
 * @constructor
 */
function Comments() {
}

/**
 * @param {root.nsType} nsType A parameter defined elsewhere and not yet converted to module syntax
 * @returns {module:root/TestOne}
 */
Comments.prototype.getTestOne = function(nsType) {
};

/**
 * @param {module:root/TestOne} one
 * @param {module:root/TestOne} two
 * @param {module:root/TestOne} three
 */
Comments.prototype.convertsMultiple = function(one, two, three) {
};

module.exports = Comments;
