"use strict";
import "./setup";

import testEmber from "./decompilation";
import shave from "../lib";
import { precompile } from "./vendor/ember-template-compiler-1.12.2";

/**
 * Compiles the specified contents to a Ember v1.12.2 handlebars template.
 */
function compile(contents) {
    return "Ember.HTMLBars.template(" + precompile(contents, false) + ");";
}

/**
 * Decompiles the provided compiled template into a raw source string.
 */
function decompile(contents) {
    return shave(contents, { globalPaths: ["Ember"] });
}

/**
 * Pipes compile(contents) into decompile(contents).
 */
function test(contents) {
    return decompile(compile(contents));
}

describe("Ember v1.1x", () => {
    testEmber(test);
});