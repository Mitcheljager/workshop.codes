import { extractAndInsertMixins } from "../../../../app/javascript/src/utils/compiler/mixins"
import { disregardWhitespace } from "../../helpers/text"

describe("mixins.js", () => {
  describe("extractAndInsertMixins", () => {
    it("Should return the original input if no mixins are given", () => {
      const input = "Some Action"
      expect(extractAndInsertMixins(input)).toBe(input)
    })

    it("Should throw an error if a mixin is given without a name", () => {
      const input = "@mixin {}"
      expect(() => extractAndInsertMixins(input)).toThrow("Mixin is missing a name")
    })

    it("Should throw an error if two mixins are defined with the same name", () => {
      const input = "@mixin someMixin() {} @mixin someMixin() {}"
      expect(() => extractAndInsertMixins(input)).toThrow("Mixin \"someMixin\" is already defined")
    })

    it("Should throw an error if a mixin is included that is not defined", () => {
      const input = "@mixin someMixin() {} @include someOtherMixin"
      expect(() => extractAndInsertMixins(input)).toThrow("Included a mixin that was not specified: \"someOtherMixin\"")
    })

    it("Should replace @include with the mixins content and remove the defined mixin from the output", () => {
      const input = `
        @mixin testMixin() {
          Global.value = 1;
        }
        rule("Rule Name") {
          @include testMixin()
        }`

      const expectedOutput = `
        rule("Rule Name") {
          Global.value = 1;
        }`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should still replace as expected when mixin bracket is on the next line", () => {
      const input = `
        @mixin testMixin()
        {
          Global.value = 1;
        }
        rule("Rule Name") {
          @include testMixin()
        }`

      const expectedOutput = `
        rule("Rule Name") {
          Global.value = 1;
        }`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should replace trailing semicolon of include when given", () => {
      const input = `
        @mixin testMixin() {
          Global.value = 1;
        }
        rule("Rule Name") {
          @include testMixin();
        }`

      const expectedOutput = `
        rule("Rule Name") {
          Global.value = 1;
        }`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should replace Mixin variables with given arguments", () => {
      const input = `
        @mixin testMixin(someArg, someOtherArg) {
          Mixin.someArg;
          Some Action(Mixin.someOtherArg);
        }
        @include testMixin(One, Two)`

      const expectedOutput = `
        One;
        Some Action(Two);`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should replace Mixin variables with given arguments", () => {
      const input = `
        @mixin testMixin(someArg, someOtherArg) {
          Mixin.someArg;
          Some Action(Mixin.someOtherArg);
        }
        @include testMixin(One, Two)`

      const expectedOutput = `
        One;
        Some Action(Two);`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should use default values if arguments are not given", () => {
      const input = `
        @mixin testMixin(someArg, someOtherArg = "Default") {
          Mixin.someArg;
          Some Action(Mixin.someOtherArg);
        }
        @include testMixin(One)`

      const expectedOutput = `
        One;
        Some Action("Default");`

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should mixin @contents with contents given in @include", () => {
      const input = `
        @mixin testMixin() {
          @contents;
        }
        @include testMixin() { Some Contents }`

      const expectedOutput = "Some Contents"

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should be able to nest mixins", () => {
      const input = `
        @mixin childMixin() {
          Child Action
        }
        @mixin testMixin() {
          @include childMixin();
        }
        @include testMixin()`

      const expectedOutput = "Child Action"

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should be able to @include inline in actions", () => {
      const input = `
        @mixin testMixin() {
          Some Value
        }
        Some Action(@include testMixin())`

      const expectedOutput = "Some Action(Some Value)"

      expect(disregardWhitespace(extractAndInsertMixins(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})
