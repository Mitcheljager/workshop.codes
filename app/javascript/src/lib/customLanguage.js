import { LRLanguage, LanguageSupport } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { parser } from "./lang.js"

export const OverwatchWorkshopLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Keyword: t.keyword,
        Action: t.bool,
        Value: t.heading,
        Function: t.function,
        Number: t.number,
        Boolean: t.number,
        String: t.string,
        LineComment: t.lineComment,
        Punctuation: t.annotation,
        Variable: t.keyword,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.brace,
        ".": t.derefOperator,
        ", ;": t.separator
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", "\"", "`"] },
    commentTokens: { line: "//" },
    indentOnInput: /^\s*([\}\]\)]|else:|elif |except |finally:)$/
  }
})

export function OverwatchWorkshop() {
  return new LanguageSupport(OverwatchWorkshopLanguage)
}
