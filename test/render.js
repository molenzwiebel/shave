import { Node, DocumentFragmentNode, ElementNode, TextNode, CommentNode, MorphNode } from "../lib/dom";
import { GetValue, LiteralValue, ConcatValue } from "../lib/value";
import { InlineMorph, AttributeMorph, ElementMorph, ContentMorph, BlockMorph } from "../lib/morph";
import { expect } from "chai";

describe("Node", () => {
    describe("DocumentFragmentNode", () => {
        it("can render", () => {
            const rootNode = new DocumentFragmentNode();
            const textNode1 = new TextNode("foo");
            const textNode2 = new TextNode("bar");
            rootNode.children = [textNode1, textNode2];

            expect(rootNode.toString()).to.equal("foo\nbar");
        });

        it("respects indentation", () => {
            const rootNode = new DocumentFragmentNode();
            const textNode1 = new TextNode("foo");
            const textNode2 = new TextNode("bar");
            rootNode.children = [textNode1, textNode2];

            expect(rootNode.toString(2)).to.equal("  foo\n  bar"); 
        });
    });

    describe("ElementNode", () => {
        it("can render", () => {
            const node = new ElementNode("a");
            expect(node.toString()).to.equal("<a>\n</a>");
        });

        it("can render attributes", () => {
            const node = new ElementNode("a");
            node.attributes["foo"] = "bar";
            expect(node.toString()).to.equal("<a foo='bar'>\n</a>");
        });

        it("can render children with correct indentation", () => {
            const node = new ElementNode("a");
            const textNode = new TextNode("foo");
            node.children = [textNode];

            expect(node.toString()).to.equal("<a>\n    foo\n</a>");
            expect(node.toString(0, { indent: 2 })).to.equal("<a>\n  foo\n</a>");
        });

        it("can render attribute morphs", () => {
            const node = new ElementNode("a");
            node.attributeMorphs = [new AttributeMorph("foo", new GetValue("bar"))];
            expect(node.toString()).to.equal("<a foo={{ bar }}>\n</a>");
        });

        it("can render inline morphs", () => {
            const node = new ElementNode("a");
            node.inlineMorphs = [new ElementMorph("foo", [new LiteralValue(10)], {})];
            expect(node.toString()).to.equal("<a {{ foo 10 }}>\n</a>");
        });
    });

    describe("TextNode", () => {
        it("can render", () => {
            const node = new TextNode("foo");
            expect(node.toString()).to.equal("foo");
        });

        it("respects indentation", () => {
            const node = new TextNode("foo");
            expect(node.toString(3)).to.equal("   foo");
        });
    });

    describe("CommentNode", () => {
        it("can render", () => {
            const node = new CommentNode("foo");
            expect(node.toString()).to.equal("<!-- foo -->");
        });

        it("respects indentation", () => {
            const node = new CommentNode("foo");
            expect(node.toString(3)).to.equal("   <!-- foo -->");
        });
    });
});

describe("Value", () => {
    describe("GetValue", () => {
        it("should render inline", () => {
            const value = new GetValue("foo.bar");
            expect(value.toInlineString()).to.equal("{{ foo.bar }}");
        });

        it("should render values", () => {
            const value = new GetValue("foo.bar");
            expect(value.toValueString()).to.equal("foo.bar");
        });
    });

    describe("LiteralValue", () => {
        it("should render strings inline", () => {
            const value = new LiteralValue("foo");
            expect(value.toInlineString()).to.equal("'foo'");
        });

        it("should render numbers inline", () => {
            const value = new LiteralValue(10);
            expect(value.toInlineString()).to.equal("10");
        });

        it("should render string values", () => {
            const value = new LiteralValue("foo");
            expect(value.toValueString()).to.equal("'foo'");
        });

        it("should render number values", () => {
            const value = new LiteralValue(10);
            expect(value.toValueString()).to.equal("10");
        });
    });

    describe("ConcatValue", () => {
        it("should render a list of strings", () => {
            const value = new ConcatValue([
                new LiteralValue("foo"),
                new LiteralValue("bar")
            ]);
            expect(value.toInlineString()).to.equal(`"foobar"`);
            expect(value.toValueString()).to.equal(`"foobar"`);
        });

        it("should render a list of mixed literals", () => {
            const value = new ConcatValue([
                new LiteralValue("foo"),
                new LiteralValue(10)
            ]);
            expect(value.toInlineString()).to.equal(`"foo10"`);
            expect(value.toValueString()).to.equal(`"foo10"`);
        });

        it("should render a single get value", () => {
            const value = new ConcatValue([new GetValue("foo.bar")]);
            expect(value.toInlineString()).to.equal(`"{{ foo.bar }}"`);
            expect(value.toValueString()).to.equal(`"{{ foo.bar }}"`);
        });

        it("should render a list of mixed values", () => {
            const value = new ConcatValue([
                new LiteralValue("The value "),
                new GetValue("foo.bar"),
                new LiteralValue(".")
            ]);
            expect(value.toInlineString()).to.equal(`"The value {{ foo.bar }}."`);
            expect(value.toValueString()).to.equal(`"The value {{ foo.bar }}."`);
        });
    });
});

describe("Morph", () => {
    describe("InlineMorph", () => {
        it("should render without args", () => {
            const morph = new InlineMorph("foo", [], {});
            expect(morph.toString()).to.equal("{{ foo }}");
        });

        it("should render params", () => {
            const morph = new InlineMorph("foo", [new LiteralValue(10)], {});
            expect(morph.toString()).to.equal("{{ foo 10 }}");
        });

        it("should render hashes", () => {
            const morph = new InlineMorph("foo", [], { bar: new LiteralValue(10) });
            expect(morph.toString()).to.equal("{{ foo bar=10 }}");
        });

        it("should render both params and hashes", () => {
            const morph = new InlineMorph("foo", [new LiteralValue(10)], { bar: new LiteralValue(10) });
            expect(morph.toString()).to.equal("{{ foo 10 bar=10 }}");
        });
    });

    describe("AttributeMorph", () => {
        it("should render", () => {
            const morph = new AttributeMorph("foo", new GetValue("bar"));
            expect(morph.toString()).to.equal("foo={{ bar }}");
        });
    });

    describe("ElementMorph", () => {
        it("should render without args", () => {
            const morph = new ElementMorph("foo", [], {});
            expect(morph.toString()).to.equal("{{ foo }}");
        });

        it("should render params", () => {
            const morph = new ElementMorph("foo", [new LiteralValue(10)], {});
            expect(morph.toString()).to.equal("{{ foo 10 }}");
        });

        it("should render hashes", () => {
            const morph = new ElementMorph("foo", [], { bar: new LiteralValue(10) });
            expect(morph.toString()).to.equal("{{ foo bar=10 }}");
        });

        it("should render both params and hashes", () => {
            const morph = new ElementMorph("foo", [new LiteralValue(10)], { bar: new LiteralValue(10) });
            expect(morph.toString()).to.equal("{{ foo 10 bar=10 }}");
        });
    });

    describe("ContentMorph", () => {
        it("should render", () => {
            const morph = new ContentMorph("foo");
            expect(morph.toString()).to.equal("{{ foo }}");
        });
    });

    describe("BlockMorph", () => {
        it("can render a single block without arguments", () => {
            const node = new TextNode("foo");
            const morph = new BlockMorph("if", [], {}, node);
            expect(morph.toString()).to.equal("{{#if }}\n    foo\n{{/if}}");
        });

        it("can render multiple blocks without arguments", () => {
            const node1 = new TextNode("foo");
            const node2 = new TextNode("bar");
            const morph = new BlockMorph("if", [], {}, node1, node2);
            expect(morph.toString()).to.equal("{{#if }}\n    foo\n{{else}}\n    bar\n{{/if}}");
        });

        it("respects indentation", () => {
            const node1 = new TextNode("foo");
            const node2 = new TextNode("bar");
            const morph = new BlockMorph("if", [], {}, node1, node2);
            expect(morph.toString(2)).to.equal("{{#if }}\n      foo\n  {{else}}\n      bar\n  {{/if}}");
        });

        it("can render params", () => {
            const node = new TextNode("foo");
            const morph = new BlockMorph("if", [new LiteralValue(10)], {}, node);
            expect(morph.toString()).to.equal("{{#if 10 }}\n    foo\n{{/if}}");
        });

        it("can render hashes", () => {
            const node = new TextNode("foo");
            const morph = new BlockMorph("if", [], { bar: new LiteralValue(10) }, node);
            expect(morph.toString()).to.equal("{{#if bar=10 }}\n    foo\n{{/if}}");
        });
    });
});