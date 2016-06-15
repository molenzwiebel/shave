"use strict";
import "./setup";

import { expect } from "chai";

/**
 * Utility function to not duplicate tests between Ember1 and Ember2.
 * Simply pass a test() function that compiles and subsequently decompiles
 * the provided code, returning the decompiled string.
 */
export default function(test) {
    describe("without morphs", () => {
        it("should decompile empty nodes", () => {
            expect(test("<div></div>")).to.equal("<div>\n</div>");
        });

        it("should decompile any valid tag name", () => {
            expect(test("<foo></foo>")).to.equal("<foo>\n</foo>");
        });

        it("should decompile text nodes", () => {
            expect(test("Foo")).to.equal("Foo");
            expect(test("<div>Foo</div>")).to.equal("<div>\n    Foo\n</div>");
        });

        it("should decompile comments", () => {
            expect(test("<!-- Foo -->")).to.equal("<!-- Foo -->");
            expect(test("<div><!-- Foo --></div>")).to.equal("<div>\n    <!-- Foo -->\n</div>");
        });

        it("should decompile static attributes", () => {
            expect(test("<a href='foo'></a>")).to.equal("<a href='foo'>\n</a>");
        });
    });

    describe("get()", () => {
        it("should decompile into the literal path", () => {
            expect(test("{{ foo }}")).to.equal("{{ foo }}");
            expect(test("{{foo}}")).to.equal("{{ foo }}");
            expect(test("{{ foo.bar }}")).to.equal("{{ foo.bar }}");
        });
    });

    describe("concat()", () => {
        it("should stringify values", () => {
            expect(test("<a foo='{{ bar }}'></a>")).to.equal(`<a foo="{{ bar }}">\n</a>`);
            expect(test("<a foo='{{ 10 }}'></a>")).to.equal(`<a foo="10">\n</a>`);
        });

        it("should stringify mixed values", () => {
            expect(test("<a foo='Bar {{ baz }} boo'></a>")).to.equal(`<a foo="Bar {{ baz }} boo">\n</a>`);
            expect(test("<a foo='Bar {{ 10 }} boo'></a>")).to.equal(`<a foo="Bar 10 boo">\n</a>`);
        });

        it("should stringify subexpressions", () => {
            expect(test("<a foo='{{ baz 10 }}'></a>")).to.equal(`<a foo="{{ baz 10 }}">\n</a>`);
        });
    });

    describe("subexpr()", () => {
        it("should decompile with params", () => {
            expect(test("<a foo={{ baz 10 '10' foo.ten }}></a>")).to.equal(`<a foo={{ baz 10 '10' foo.ten }}>\n</a>`);
        });

        it("should decompile with hashes", () => {
            expect(test("<a foo={{ baz a=10 b='10' c=foo.ten }}></a>")).to.equal(`<a foo={{ baz a=10 b='10' c=foo.ten }}>\n</a>`);
        });

        it("should decompile with params and hashes", () => {
            expect(test("<a foo={{ baz 10 a='10' b=foo.ten }}></a>")).to.equal(`<a foo={{ baz 10 a='10' b=foo.ten }}>\n</a>`);
        });
    });

    describe("inline()", () => {
        it("should decompile as a child", () => {
            expect(test("<a>{{ foo '10' }}</a>")).to.equal("<a>\n    {{ foo '10' }}\n</a>");
        });

        it("should decompile with params", () => {
            expect(test("{{ foo 10 '10' bar.baz }}")).to.equal("{{ foo 10 '10' bar.baz }}");
        });

        it("should decompile with hashes", () => {
            expect(test("{{ foo a=10 b='10' c=bar.baz }}")).to.equal("{{ foo a=10 b='10' c=bar.baz }}");
        });

        it("should decompile with params and hashes", () => {
            expect(test("{{ foo 10 a='10' b=bar.baz }}")).to.equal("{{ foo 10 a='10' b=bar.baz }}");
        });
    });

    describe("attribute()", () => {
        it("should decompile literal values", () => {
            expect(test("<a foo={{ 10 }}></a>")).to.equal("<a foo=10>\n</a>");
            expect(test("<a foo={{ 'bar' }}></a>")).to.equal("<a foo='bar'>\n</a>");
        });

        it("should decompile paths", () => {
            expect(test("<a foo={{ bar }}></a>")).to.equal("<a foo={{ bar }}>\n</a>");
            expect(test("<a foo={{ bar.baz }}></a>")).to.equal("<a foo={{ bar.baz }}>\n</a>");
        });

        it("should decompile concats", () => {
            expect(test("<a foo='{{ bar }}'></a>")).to.equal(`<a foo="{{ bar }}">\n</a>`);
            expect(test("<a foo='Foo is {{ bar }}'></a>")).to.equal(`<a foo="Foo is {{ bar }}">\n</a>`);
        });
    });

    describe("element()", () => {
        it("should decompile without args", () => {
            expect(test("<a {{ foo }}></a>")).to.equal("<a {{ foo }}>\n</a>");
        });

        it("should decompile with params", () => {
            expect(test("<a {{ foo 10 '10' foo.bar }}></a>")).to.equal("<a {{ foo 10 '10' foo.bar }}>\n</a>");
        });

        it("should decompile with hashes", () => {
            expect(test("<a {{ foo a=10 b='10' c=foo.bar }}></a>")).to.equal("<a {{ foo a=10 b='10' c=foo.bar }}>\n</a>");
        });
    });

    describe("content()", () => {
        it("should copy paths", () => {
            expect(test("{{ foo }}")).to.equal("{{ foo }}");
            expect(test("{{ foo.bar }}")).to.equal("{{ foo.bar }}");
        });

        it("should treat strings the same way as paths", () => {
            expect(test("{{ foo }}")).to.equal("{{ foo }}");
            expect(test("{{ 'foo' }}")).to.equal("{{ foo }}");
        });

        it("should copy any literal value", () => {
            expect(test("{{ 'foo' }}")).to.equal("{{ foo }}");
            expect(test("{{ 10 }}")).to.equal("{{ 10 }}");
        });
    });

    describe("block()", () => {
        it("should decompile with a single node and no args", () => {
            expect(test("{{#foo}}Bar{{/foo}}")).to.equal("{{#foo }}\n    Bar\n{{/foo}}");
        });

        it("should decompile with a single node and params", () => {
            expect(test("{{#foo 10 '10' test }}Bar{{/foo}}")).to.equal("{{#foo 10 '10' test }}\n    Bar\n{{/foo}}");
        });

        it("should decompile with a single node and hashes", () => {
            expect(test("{{#foo a=10 b='10' c=test }}Bar{{/foo}}")).to.equal("{{#foo a=10 b='10' c=test }}\n    Bar\n{{/foo}}");
        });

        it("should decompile with a single node and both params and hashes", () => {
            expect(test("{{#foo 10 a='10' b=test }}Bar{{/foo}}")).to.equal("{{#foo 10 a='10' b=test }}\n    Bar\n{{/foo}}");
        });

        it("should decompile with an alternate node and no args", () => {
            expect(test("{{#foo}}A{{else}}B{{/foo}}")).to.equal("{{#foo }}\n    A\n{{else}}\n    B\n{{/foo}}");
        });

        it("should decompile with an alternate node and params", () => {
            expect(test("{{#foo 10 '10' test}}A{{else}}B{{/foo}}")).to.equal("{{#foo 10 '10' test }}\n    A\n{{else}}\n    B\n{{/foo}}");
        });

        it("should decompile with an alternate node and hashes", () => {
            expect(test("{{#foo a=10 b='10' c=test}}A{{else}}B{{/foo}}")).to.equal("{{#foo a=10 b='10' c=test }}\n    A\n{{else}}\n    B\n{{/foo}}");
        });

        it("should decompile with an alternate node and both params and hashes", () => {
            expect(test("{{#foo 10 a='10' b=test}}A{{else}}B{{/foo}}")).to.equal("{{#foo 10 a='10' b=test }}\n    A\n{{else}}\n    B\n{{/foo}}");
        });

        it("should decompile nested blocks", () => {
            expect(test(`{{#if foo}}{{#if bar}}A{{/if}}{{else}}{{#if boo}}B{{/if}}{{/if}}`)).to.equal(`{{#if foo }}\n    {{#if bar }}\n        A\n    {{/if}}\n{{else}}\n    {{#if boo }}\n        B\n    {{/if}}\n{{/if}}`);
        });
    });
}