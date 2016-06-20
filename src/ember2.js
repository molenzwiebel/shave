"use strict";

import HTMLBarsDOM from "./dom";
import { Value, GetValue, LiteralValue, ConcatValue, SubexprValue } from "./value";
import { InlineMorph, AttributeMorph, ElementMorph, ContentMorph, BlockMorph } from "./morph";

/**
 * Throws an error if the specified template is not a valid Ember v2.x template.
 */
function validateTemplate(template) {
    if (!template
        || !template.meta
        || !template.meta.revision
        || !template.buildFragment
        || typeof template.buildFragment !== "function"
        || !template.buildRenderNodes
        || typeof template.buildRenderNodes !== "function"
        || !template.statements
        || !Array.isArray(template.statements)
        || !template.templates
        || !Array.isArray(template.templates)) {
        throw new Error("Template " + JSON.stringify(template) + " is an invalid Ember v2.x template.");
    }
}

/**
 * Converts a params array. ["a", ["get", "foo"]] -> [LiteralValue('a'), GetValue('foo')]
 */
function convertParams(params) {
    return params.map(param => {
        if (!Array.isArray(param)) {
            return new LiteralValue(param);
        }

        return evaluateExpression(param);
    });
}

/**
 * Converts a hash.
 * @see convertParams
 */
function convertHash(hash) {
    const ret = {};
    
    for (let i = 0; i < hash.length; i += 2) {
        const key = hash[i];
        const value = hash[i + 1];

        if (!Array.isArray(value)) {
            ret[key] = new LiteralValue(value);
        } else {
            ret[key] = evaluateExpression(value);
        }
    }

    return ret;
}

const EXPRESSION_PARSERS = {
    get(path) {
        return new GetValue(path);
    },

    concat(parts) {
        return new ConcatValue(convertParams(parts));
    },

    subexpr(name, rawParams, rawHash) {
        return new SubexprValue(
            name,
            convertParams(rawParams),
            convertHash(rawHash)
        );
    }
};

/**
 * Evaluates an expression array.
 */
function evaluateExpression([op, ...args]) {
    if (!EXPRESSION_PARSERS[op]) throw new Error("Invalid expression '" + op + "'");

    return EXPRESSION_PARSERS[op](...args);
}

const STATEMENT_PARSERS = {
    inline(el, morph, name, params, hash) {
        morph.morph = new InlineMorph(
            name,
            convertParams(params),
            convertHash(hash)
        );
    },

    attribute(el, morph, name, value) {
        morph.value = convertParams([value])[0];
    },

    element(el, morph, name, params, hash) {
        el.inlineMorphs.push(new ElementMorph(
            name,
            convertParams(params),
            convertHash(hash)
        ));
    },

    content(el, morph, cont) {
        morph.morph = new ContentMorph(cont);
    }
};

/**
 * Evaluates a statement array.
 */
function evaluateStatement(el, morph, [op, ...args]) {
    if (!STATEMENT_PARSERS[op]) throw new Error("Invalid statement '" + op + "'");

    return STATEMENT_PARSERS[op](el, morph, ...args);
}

/**
 * Responsible for converting the specified javascript object.
 * Does so by evaluating nodes.
 */
export default function(template) {
    validateTemplate(template);

    const dom = new HTMLBarsDOM();
    const fragment = template.buildFragment(dom);
    const morphs = template.buildRenderNodes(dom, fragment, null);

    if (morphs.length !== template.statements.length) throw new Error("Invalid result from buildRenderNodes()");

    for (let i = 0; i < morphs.length; i++) {
        evaluateStatement(morphs[i].parent, morphs[i], template.statements[i]);
    }

    return fragment;
}