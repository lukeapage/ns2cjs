ns2cjs
======

Converts from namespace like files e.g.

```js
// file root/namespace/file.js
/**
  * @constructor
  */
root.namespace.file = function() {
};
```

to common js format

```js
// file root/namespace/file.js
/**
  * @module root/namespace/file.js
  */
var jQuery = require("jquery");
/**
  * @alias module:root/namespace/file
  * @constructor
  */
var file = function() {
};
module.exports = file;
```
