"use strict";

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
        return " ".repeat(indent) + "<!-- " + this.contents + " -->";
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