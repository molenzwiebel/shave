"use strict";

import { AttributeMorph } from "./morph";

/**
 * Fake DOM manager that talks to the compiled template.
 */
export default class HTMLBarsDOM {
    constructor() {
        // Prevent Ember v1.xx from trying to clone elements.
        // It'll just create new nodes when this is `false`.
        this.canClone = false;
    }

    /**
     * Creates a new 'root' fragment.
     * Due to the way fragments are handled in
     * HTMLBars, there may be multiple root
     * fragments inside of other root fragments.
     */
    createDocumentFragment() {
        return new DocumentFragmentNode();
    }

    /**
     * Creates a plain text node.
     */
    createTextNode(contents) {
        return new TextNode(contents);
    }

    /**
     * Creates a plain comment node.
     */
    createComment(contents) {
        return new CommentNode(contents);
    }

    /**
     * Creates a plain element.
     */
    createElement(tagName) {
        return new ElementNode(tagName);
    }

    /**
     * Appends `child` to `parent`.
     */
    appendChild(parent, child) {
        parent.children.push(child);
    }

    /**
     * Sets raw attribute `key` to `value` in `node`.
     */
    setAttribute(node, key, value) {
        node.attributes[key] = value;
    }

    /**
     * Resolves a node through a list of child indexes.
     */
    childAt(node, path) {
        return path.reduce((n, idx) => n.children[idx], node);
    }

    /**
     * Creates a new morph that replaces the specified child(ren) of the node.
     */
    createMorphAt(node, beginIdx, endIdx) {
        const morph = new MorphNode(null);
        node.children.splice(beginIdx, endIdx + 1 - beginIdx, morph);
        return morph;
    }

    /**
     * Creates a new `unsafe` morph.
     * @see createMorphAt
     */
    createUnsafeMorphAt(node, beginIdx, endIdx) {
        //TODO(molenzwiebel): Render unsafe morphs.
        return this.createMorphAt(node, beginIdx, endIdx);
    }

    /**
     * Creates a new attribute morph for the specified node.
     */
    createAttrMorph(node, attributeName) {
        const morph = new AttributeMorph(attributeName, null);
        node.attributeMorphs.push(morph);
        return morph;
    }

    /**
     * Detects namespaces, but we don't care.
     */
    detectNamespace(arg) {}

    /**
     * Inserts boundaries, but not interesting for us.
     */
    insertBoundary(node, idx) {}
}

/**
 * Represents a node in the fake dom that we create for HTMLBars to modify.
 */
export class Node {
    constructor() {
        /** All children of this node. */
        this.children = [];

        /**
         * All 'static' attributes of this node.
         * These are all known without 'computing' and are
         * most of the time simple string literals.
         * */
        this.attributes = {};

        /**
         * A list of attribute morphs applied to the
         * node. These dynamically resolve to a value.
         */
        this.attributeMorphs = [];
    }
}

/**
 * Root fragment node as created with `dom.createDocumentFragment`.
 * Simply renders all children.
 */
export class DocumentFragmentNode extends Node {
    toString(indent = 0, args = {}) {
        return this.children.map(node => node.toString(indent, args)).join("\n");
    }
}

/**
 * Represents a HTML DOM element with a tag name, attributes and children.
 * Renders the tag and itself.
 */
export class ElementNode extends Node {
    constructor(tagName) {
        super();
        this.tagName = tagName;
        this.inlineMorphs = [];
    }

    toString(indent = 0, args = {}) {
        const attributesString = Object.keys(this.attributes).map(attr => attr + "='" + this.attributes[attr] + "'").join(" ");
        const attributeMorphString = this.attributeMorphs.map(morph => morph.toString()).join(" ");
        const helperString = this.inlineMorphs.map(helper => helper.toString()).join(" ");

        const indentStep = args.indent || 4;
        const childrenString = this.children.length ? this.children.map(node => node.toString(indent + indentStep, args)).join("\n") + "\n" : "";

        return "<" + this.tagName
            + (attributesString ? " " + attributesString : "")
            + (attributeMorphString ? " " + attributeMorphString : "")
            + (helperString ? " " + helperString : "")
            + ">\n" + childrenString + "</" + this.tagName + ">";
    }
}

/**
 * Simple text node, only renders its contents.
 */
export class TextNode extends Node {
    constructor(contents) {
        super();
        this.contents = contents;
    }

    toString(indent = 0, args = {}) {
        return " ".repeat(indent) + this.contents;
    }
}

/**
 * Simple comment node, only renders its contents.
 */
export class CommentNode extends Node {
    constructor(contents) {
        super();
        this.contents = contents;
    }

    toString(indent = 0, args = {}) {
        return " ".repeat(indent) + "<!--" + this.contents + "-->";
    }
}

/**
 * Renders its underlying morph.
 */
export class MorphNode extends Node {
    constructor(morph) {
        super();
        this.morph = morph;
    }

    toString(indent = 0, args = {}) {
        return " ".repeat(indent) + this.morph.toString(indent, args);
    }
}