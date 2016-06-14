"use strict";

import vm from "vm";

/**
 * Evaluates the provided javascript source code in a complete clean environment.
 * The new environment has no access to anything, except from what was provided in 
 * the context param. It cannot use `require` or `process` either (unless given access).
 */
export function safeEval(src, context = {}, clone = true) {
    // Clone context if neccessary.
    const sandbox = clone ? Object.assign({}, context) : context;

    // Run code.
    vm.runInNewContext(src, sandbox);

    // Return context that was possibly modified.
    return sandbox;
}

/**
 * Creates objects in such a way that you can access `object`
 * by getting `root`.`path`. For example, running `definePath({}, true, "foo.bar")`
 * will return the following:
 * `{ foo: { bar: true } }`
 */
export function definePath(root, object, path) {
    if (!path) return;
    const parts = path.split(".");
    
    let cur = root;
    while (parts.length) {
        const next = parts.shift();

        if (parts.length !== 0 && cur[next]) {
            if (typeof cur[next] !== "object") throw new TypeError("Cannot create path: variable is already taken by non-object.");
            cur = cur[next];
        } else {
            cur[next] = cur = parts.length ? {} : object;
        }
    }
}