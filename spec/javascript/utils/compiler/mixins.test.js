import { extractAndInsertMixins, replaceContents, getOpeningBracketAt } from "../../../../app/javascript/src/utils/compiler/mixins"
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

    it("Should throw an error if the mixin includes itself", () => {
      const input = "@mixin testMixin() { @include testMixin(); }"
      expect(() => extractAndInsertMixins(input)).toThrow("Can not include a mixin in itself")
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

    it("Should avoid replacing one Mixin variable with the value of another when the variable names overlap", () => {
      const input = `
        @mixin testMixin(someArg, someArg2) {
          Mixin.someArg;
          Some Action(Mixin.someArg2);
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

  describe("replaceContents", () => {
    it("Should replace @contents with default content", () => {
      const joinedItems = "@include testMixin() { Global.value = 1; }"
      const replaceWith = "@contents;"

      const result = replaceContents(joinedItems, 0, 20, replaceWith)

      expect(disregardWhitespace(result.contents)).toEqual(disregardWhitespace("Global.value = 1;"))
      expect(result.fullMixin).toEqual(joinedItems)
      expect(result.replaceWith).toEqual("Global.value = 1;")
    })

    it("Should replace @contents with corresponding slot content", () => {
      const joinedItems = `@include testMixin() {
        @slot("Slot 1") { Global.slot = 1; } @slot("Slot 2") { Global.slot = 2; }
      }`
      const replaceWith = "@contents(\"Slot 1\"); Action(@contents(\"Slot 2\")); @contents(\"Slot 2\");"

      const result = replaceContents(joinedItems, 0, 20, replaceWith)

      expect(disregardWhitespace(result.contents)).toEqual(disregardWhitespace("@slot(\"Slot 1\") { Global.slot = 1; } @slot(\"Slot 2\") { Global.slot = 2; }"))
      expect(result.fullMixin).toEqual(joinedItems)
      expect(result.replaceWith).toEqual("Global.slot = 1; Action(Global.slot = 2;); Global.slot = 2;")
    })

    it("Should replace both @contents with corresponding slot content and default content", () => {
      const joinedItems = `@include testMixin() {
        Global.value = 1; @slot("Slot 1") { Global.slot = 1; } @slot("Slot 2") { Global.slot = 2; }
      }`
      const replaceWith = "@contents; @contents(\"Slot 1\"); Action(@contents(\"Slot 2\")); @contents(\"Slot 2\");"

      const result = replaceContents(joinedItems, 0, 20, replaceWith)

      expect(disregardWhitespace(result.contents)).toEqual(disregardWhitespace("Global.value = 1; @slot(\"Slot 1\") { Global.slot = 1; } @slot(\"Slot 2\") { Global.slot = 2; }"))
      expect(result.fullMixin).toEqual(joinedItems)
      expect(result.replaceWith).toEqual("Global.value = 1; Global.slot = 1; Action(Global.slot = 2;); Global.slot = 2;")
    })

    it("Should replace @contents without matching @slot with nothing", () => {
      const joinedItems = `@include testMixin() {
        @slot("Slot 1") { Global.slot = 1; }
      }`
      const replaceWith = "@contents(\"Slot 1\"); @contents(\"Slot 2\");"

      const result = replaceContents(joinedItems, 0, 20, replaceWith)

      expect(disregardWhitespace(result.contents)).toEqual(disregardWhitespace("@slot(\"Slot1\") { Global.slot=1; }"))
      expect(result.fullMixin).toEqual(joinedItems)
      expect(disregardWhitespace(result.replaceWith)).toEqual(disregardWhitespace("Global.slot = 1;"))
    })
  })

  describe("getOpeningBracketAt", () => {
    it("Should return the index of the first bracket", () => {
      expect(getOpeningBracketAt(" {")).toBe(1)
    })
  })
})
