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

/**
 * "Foo {{ helperName params... hash... }}"
 */
export class SubexprValue extends Value {
    constructor(helperName, params, hash) {
        super();
        this.helperName = helperName;
        this.params = params;
        this.hash = hash;
    }

    toInlineString() {
        return this.toValueString();
    }

    toValueString() {
        const paramString = this.params.map(p => p.toValueString()).join(" ");
        const hashString = Object.keys(this.hash).map(h => h + "=" + this.hash[h].toValueString()).join(" ");

        return "{{ " + this.helperName
            + (paramString ? " " + paramString : "")
            + (hashString ? " " + hashString : "")
            + " }}";
    }
}