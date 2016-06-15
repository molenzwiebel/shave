"use strict";

// Setup tests. Ignore vendor because
// Babel is too smart for the Ember
// template compiler (sets `this` to undefined).
require("babel-register")({
    ignore: /node_module|vendor/
});