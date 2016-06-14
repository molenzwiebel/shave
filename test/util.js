import { safeEval, definePath } from "../lib/util";
import { expect } from "chai";

describe("Utilities", () => {
    describe("safeEval", () => {
        it("evaluates javascript", () => {
            expect(safeEval("3 + 3")).to.eql({});
        });

        it("propagates exceptions", () => {
            expect(() => {
                safeEval("throw new TypeError('Foo');")
            }).to.throw("Foo");
        });

        it("does not have access to locals", () => {
            expect(() => {
                const foo = 10;
                safeEval("var value = foo;");
            }).to.throw("foo is not defined");
        });

        it("does not have access to node globals", () => {
            expect(() => {
                safeEval("require");
            }).to.throw("require is not defined");

            expect(() => {
                safeEval("process");
            }).to.throw("process is not defined");
        });

        it("injects the specified context", () => {
            const context = { foo: 10, bar: 20 };
            expect(() => {
                safeEval("if (foo !== 10 || bar !== 20) throw new Error();", context);
            }).to.not.throw(Error);
        });

        it("clones the context by default", () => {
            const context = { foo: 10, bar: 20, baz: 0 };
            safeEval("baz = foo + bar;", context);
            expect(context.baz).to.equal(0);
        });

        it("can ignore cloning", () => {
            const context = { foo: 10, bar: 20, baz: 0 };
            safeEval("baz = foo + bar;", context, false);
            expect(context.baz).to.equal(30);
        });

        it("does not modify the context when not cloning", () => {
            const context = { };
            safeEval("var foo = 10; var bar = 20;", context);
            expect(context).to.eql({});
        });

        it("modifies the context when cloning", () => {
            const context = { };
            safeEval("var foo = 10; var bar = 20;", context, false);
            expect(context).to.eql({ foo: 10, bar: 20 });
        });
    });

    describe("definePath", () => {
        it("does nothing on an empty path", () => {
            const root = {};
            const object = true;
            definePath(root, object, "");

            expect(root).to.eql({});
        });

        it("does a single level", () => {
            const root = {};
            const object = true;
            definePath(root, object, "foo");

            expect(root).to.eql({ foo: object });
        });

        it("does multiple levels", () => {
            const root = {};
            const object = true;
            definePath(root, object, "foo.bar");
            
            expect(root).to.eql({ foo: { bar: object } });
        });

        it("does not override existing object members", () => {
            const root = { foo: { myVar: 10 } };
            const object = true;
            definePath(root, object, "foo.bar");

            expect(root).to.eql({ foo: { bar: object, myVar: 10 } });
        });

        it("errors when members cannot be created", () => {
            const root = { foo: 10 };
            const object = true;
            
            expect(() => {
                definePath(root, object, "foo.bar");
            }).to.throw(TypeError);
        });
    });
});