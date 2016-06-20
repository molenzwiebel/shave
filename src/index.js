"use strict";

import { safeEval, definePath } from "./util";
import ember1 from "./ember1";
import ember2 from "./ember2";

/**
 * Converts the specified compiled HTMLBars source into
 * something that resembles the original.
 * 
 * Options:
 * - context: A key:value hash of values available in the VM that runs the specified javascript.
 *            The map is cloned, so you'll not get updates when the template modifies the globals.
 *            Do not add an `Ember` or `require` global here. They will be overwritten by our fake
 *            versions of their respective values.
 * 
 * - requireEmberPaths: By default, Shave exports a fake `Ember` instance with every require call,
 *                      so that `const Ember = require("ember");` will work. For every path added here,
 *                      a fake Ember instance will be added. For example, setting requireEmberPaths to
 *                      ["foo.Ember"] will enable the following: `const Ember = require("ember").foo.Ember;`
 * 
 * - globalPaths: By default, Shave does not export a global `Ember` variable, because of possible require
 *                calls where our value will get overwritten (or cause errors in strict mode). For every path
 *                added here, a fake Ember instance will be added to the root object. For example, setting
 *                globalPaths to ["Ember", "foo.bar.Ember"] will enable the following code to work:
 *                `const HTMLBars = Ember.HTMLBars;`, as well as `const HTMLBars = foo.bar.Ember.HTMLBars;`
 *                without earlier definition first.
 */
export default function(stringContents, options = {}) {
    const { context = {}, requireEmberPaths = [], globalPaths = [] } = options;
    let template;

    // Fake Ember instance that we inject into our sandbox.
    const fakeEmber = {
        HTMLBars: {
            template(node) {
                if (template) throw new Error("Ember.HTMLBars.template called repeatedly.");
                template = node;
            }
        },

        Handlebars: {
            template() {
                throw new Error("Ember versions older than 1.10 are not supported.");
            }
        }
    };

    // Setup require() results.
    const requireResult = Object.assign({}, fakeEmber);
    requireEmberPaths.forEach(path => definePath(requireResult, fakeEmber, path));

    // Setup sandbox context.
    const sandboxCtx = Object.assign({
        require() { return requireResult; },
        module: {}
    }, context);
    globalPaths.forEach(path => definePath(sandboxCtx, fakeEmber, path));

    // Run actual code.
    safeEval(stringContents, sandboxCtx);

    // Check the resulting object to see what to do with it.
    if (!template) throw new Error("Ember.HTMLBars.template not invoked.");
    if (!template.revision && (!template.meta || !template.meta.revision)) throw new Error("Invalid template: revision missing.");

    const majorVersion = +/Ember@(\d+).*/.exec(template.revision || template.meta.revision)[1];
    if (majorVersion !== 1 && majorVersion !== 2) throw new Error("Unsupported HTMLBars/Ember version: " + template.revision);

    // Decompile, return result.
    const result = {
        1: ember1,
        2: ember2
    }[majorVersion](template);

    return result.toString();
}