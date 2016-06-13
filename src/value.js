"use strict";

export class Value {
    /**
     * Every subclass of this class should implement at least the following methods:
     * 
     * toInlineString(): string
     * Render the value in the context of <tagName attrName=VALUE>.
     * 
     * toValueString(): string
     * Render the value in the context of {{ helperName foo=VALUE }}.
     */
}

/**
 * foo.bar
 */
export class GetValue extends Value {
    constructor(path) {
        super();
        this.path = path;
    }

    toInlineString() {
        return "{{ " + this.path + " }}";
    }

    toValueString() {
        return this.path;
    }
}

/**
 * Literal value, as in a string or a number.
 */
export class LiteralValue extends Value {
    constructor(value) {
        super();
        this.value = value;
    }

    toInlineString() {
        return this.toValueString();
    }

    toValueString() {
        return typeof this.value === "string" ? ("'" + this.value + "'") : (this.value + "");
    }
}

/**
 * "Foo {{ foo.bar }} bar"
 */
export class ConcatValue extends Value {
    constructor(elements) {
        super();
        this.elements = elements;
    }

    toInlineString() {
        return this.toValueString();
    }

    toValueString() {
        return "\"" + this.elements.map(el => {
            if (el instanceof LiteralValue) return el.value + "";
            return el.toInlineString();
        }).join("") + "\"";
    }
}