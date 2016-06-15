"use strict";

import HTMLBarsDOM from "./dom";
import { Value, GetValue, LiteralValue, ConcatValue, SubexprValue } from "./value";
import { InlineMorph, AttributeMorph, ElementMorph, ContentMorph, BlockMorph } from "./morph";

/**
 * Converts a params array. ['a', get(env, ctx, "foo")] -> [LiteralValue('a'), GetValue('foo')]
 */
function convertParams(params) {
    return params.map(param => {
        if (!(param instanceof Value)) {
            return new LiteralValue(param);
        }

        return param;
    });
}

/**
 * Converts a hash.
 * @see convertParams
 */
function convertHash(hash) {
    Object.keys(hash).forEach(key => {
        const value = hash[key];
        if (!(value instanceof Value)) {
            hash[key] = new LiteralValue(value);
        }
    });

    return hash;
}

/**
 * Get helper.
 */
function get(env, ctx, path) {
    return new GetValue(path);
}

/**
 * Concat helper.
 */
function concat(env, params) {
    return new ConcatValue(convertParams(params));
}

/**
 * Subexpr helper.
 */
function subexpr(env, ctx, name, params, hash) {
    return new SubexprValue(
        name,
        convertParams(params),
        convertHash(hash)
    );
}

/**
 * Inline helper.
 */
function inline(env, morph, ctx, name, params, hash) {
    morph.morph = new InlineMorph(
        name,
        convertParams(params),
        convertHash(hash)
    );
}

/**
 * Attribute helper.
 */
function attribute(env, morph, el, name, value) {
    morph.value = value instanceof Value ? value : new LiteralValue(value);
}

/**
 * Element helper.
 */
function element(env, el, ctx, name, params, hash) {
    el.inlineMorphs.push(new ElementMorph(
        name,
        convertParams(params),
        convertHash(hash)
    ));
}

/**
 * Content helper.
 */
function content(env, morph, ctx, cont) {
    morph.morph = new ContentMorph(cont);
}

/**
 * Block helper.
 */
function block(env, morph, ctx, name, params, hash, thenBlock, elseBlock) {
    morph.morph = new BlockMorph(
        name,
        convertParams(params),
        convertHash(hash),
        render(thenBlock),
        elseBlock ? render(elseBlock) : null
    );
}


/**
 * Responsible for converting the specified javascript object.
 * Does so by evaluating nodes and creating morphs.
 */
export default function render(template) {
    const dom = new HTMLBarsDOM();

    const context = null;
    const env = {
        dom,
        hooks: {
            get,
            concat,
            inline,
            subexpr,
            attribute,
            element,
            content,
            block
        }
    };

    return template.render(context, env, null);
}