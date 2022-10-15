import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { parser } from "./lang.js"

export const OverwatchWorkshopLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
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
        "( )": t.paren
      })
    ]
  }),
  languageData: {
    commentTokens: {line: ";"}
  }
})

export function OverwatchWorkshop() {
  return new LanguageSupport(OverwatchWorkshopLanguage)
}
