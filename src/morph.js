"use strict";

export class Morph {

}

/**
 * {{ helperName params... key=value... }}
 */
export class InlineMorph extends Morph {
    constructor(helperName, params, hash) {
        super();
        this.helperName = helperName;
        this.params = params;
        this.hash = hash;
    }

    toString() {
        const paramString = this.params.map(p => p.toValueString()).join(" ");
        const hashString = Object.keys(this.hash).map(h => h + "=" + this.hash[h].toValueString()).join(" ");

        return "{{ " + this.helperName
            + (paramString ? " " + paramString : "")
            + (hashString ? " " + hashString : "")
            + " }}";
    }
}

/**
 * <tagName attributeKey={{ value }}>
 */
export class AttributeMorph extends Morph {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }

    toString() {
        return this.key + "=" + this.value.toInlineString();
    }
}

/**
 * <tagName {{ helperName params... key=value... }}
 */
export class ElementMorph extends Morph {
    constructor(helperName, params, hash) {
        super();
        this.helperName = helperName;
        this.params = params;
        this.hash = hash;
    }

    toString() {
        const paramString = this.params.map(p => p.toValueString()).join(" ");
        const hashString = Object.keys(this.hash).map(h => h + "=" + this.hash[h].toValueString()).join(" ");

        return "{{ " + this.helperName
            + (paramString ? " " + paramString : "")
            + (hashString ? " " + hashString : "")
            + " }}";
    }
}

/**
 * <tagName>
 *     {{ contents }}
 * </tagName>
 */
export class ContentMorph extends Morph {
    constructor(contentString) {
        super();
        this.contentString = contentString;
    }

    toString() {
        return "{{ " + this.contentString + " }}";
    }
}

/**
 * {{#blockName params... key=value...}}
 *      <consequent_block>
 * ({{else}}
 *      <otherwise_block>)
 * {{/blockName}}
 */
export class BlockMorph extends Morph {
    constructor(blockName, params, hash, node1, node2 = null) {
        super();
        this.blockName = blockName;
        this.params = params;
        this.hash = hash;
        this.node1 = node1;
        this.node2 = node2;
    }

    toString(indent = 0, args = {}) {
        const paramString = this.params.map(p => p.toValueString()).join(" ");
        const hashString = Object.keys(this.hash).map(h => h + "=" + this.hash[h].toValueString()).join(" ");

        const indentStep = args.indent || 4;

        const endString = this.node2 ?
            "\n" + " ".repeat(indent)
            + "{{else}}\n"
            + this.node2.toString(indent + indentStep)
            + "\n" + " ".repeat(indent) + "{{/" + this.blockName + "}}"
            : "\n" + " ".repeat(indent) + "{{/" + this.blockName + "}}"

        return "{{#" + this.blockName
            + (paramString ? " " + paramString : "")
            + (hashString ? " " + hashString : "")
            + " }}\n" + this.node1.toString(indent + indentStep)
            + endString;
    }
}