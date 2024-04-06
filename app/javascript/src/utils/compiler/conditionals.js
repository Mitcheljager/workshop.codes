import { comparisonOperators, sortedComparisonOperatorsSymbols } from "@utils/operators"
import { getClosingBracket, removeSurroundingParenthesis, replaceBetween } from "@utils/parse"

export function evaluateConditionals(joinedItems) {
  const ifStartRegex = /@if[\s\n]*\(/g
  const startBracketRegex = /[\s\n]*\{/g
  const elseStartRegex = /[\s\n]*@else[\s\n]*\{/g
  const elseIfStartRegex = /[\s\n]*@else if[\s\n]*\(/g

  let match
  while ((match = ifStartRegex.exec(joinedItems)) != null) {
    const openingConditionParenIndex = match.index + match[0].length - 1
    const closingConditionParenIndex = getClosingBracket(joinedItems, "(", ")", openingConditionParenIndex - 1)
    if (closingConditionParenIndex < 0) {
      continue
    }

    const conditionExpression = joinedItems.substring(openingConditionParenIndex + 1, closingConditionParenIndex)
    const conditionExpressionTree = getExpressionTree(conditionExpression)

    startBracketRegex.lastIndex = closingConditionParenIndex + 1 // set start position for the exec below
    const startBracketMatch = startBracketRegex.exec(joinedItems)
    if (startBracketMatch == null || startBracketMatch.index !== closingConditionParenIndex + 1) {
      continue
    }

    const openingBracketIndex = startBracketMatch.index + startBracketMatch[0].length - 1
    let closingBracketIndex = getClosingBracket(joinedItems, "{", "}", openingBracketIndex - 1)
    if (closingBracketIndex < 0) {
      continue
    }

    let conditionalEndingIndex = closingBracketIndex

    let trueBlockContent = joinedItems.substring(openingBracketIndex + 1, closingBracketIndex)
    let falseBlockContent = ""
    let passed = evaluateExpressionTree(conditionExpressionTree)

    elseIfStartRegex.lastIndex = closingBracketIndex
    let elseIfMatch = elseIfStartRegex.exec(joinedItems)

    while (elseIfMatch != null && elseIfMatch.index === closingBracketIndex + 1) {
      const openingElseifConditionParenIndex = elseIfMatch.index + elseIfMatch[0].length - 1
      const closingElseifConditionParenIndex = getClosingBracket(joinedItems, "(", ")", openingElseifConditionParenIndex - 1)
      if (closingElseifConditionParenIndex < 0) {
        break
      }

      const conditionElseifExpression = joinedItems.substring(openingElseifConditionParenIndex + 1, closingElseifConditionParenIndex)
      const conditionElseifExpressionTree = getExpressionTree(conditionElseifExpression)

      startBracketRegex.lastIndex = closingElseifConditionParenIndex + 1 // set start position for the exec below
      const startElseifBracketMatch = startBracketRegex.exec(joinedItems)
      if (startElseifBracketMatch == null || startElseifBracketMatch.index !== closingElseifConditionParenIndex + 1) {
        break
      }

      const openingElseifBracketIndex = startElseifBracketMatch.index + startElseifBracketMatch[0].length - 1
      closingBracketIndex = getClosingBracket(joinedItems, "{", "}", openingElseifBracketIndex - 1)
      if (closingBracketIndex < 0) {
        break
      }

      conditionalEndingIndex = closingBracketIndex

      if (!passed) {
        passed = evaluateExpressionTree(conditionElseifExpressionTree)
        if (passed) {
          trueBlockContent = joinedItems.substring(openingElseifBracketIndex + 1, closingBracketIndex)
        }
      }

      elseIfStartRegex.lastIndex = closingBracketIndex
      elseIfMatch = elseIfStartRegex.exec(joinedItems)
    }

    elseStartRegex.lastIndex = closingBracketIndex + 1 // set start position for the exec below
    const elseMatch = elseStartRegex.exec(joinedItems)
    if (elseMatch != null && elseMatch.index === closingBracketIndex + 1) {
      const afterElseMatchedTextIndex = elseMatch.index + elseMatch[0].length
      const matchingClosingBracketForElseIndex = getClosingBracket(joinedItems, "{", "}", afterElseMatchedTextIndex - 2)
      if (matchingClosingBracketForElseIndex > 0) {
        falseBlockContent = joinedItems.substring(afterElseMatchedTextIndex, matchingClosingBracketForElseIndex)
        conditionalEndingIndex = matchingClosingBracketForElseIndex
      } else {
        continue
      }
    }

    const finalContent = passed ? trueBlockContent : falseBlockContent
    joinedItems = replaceBetween(
      joinedItems,
      finalContent,
      match.index,
      conditionalEndingIndex + 1
    )
    // reset regex last index to right on the replaced content, to allow for nested `@if`s
    ifStartRegex.lastIndex = match.index
  }

  return joinedItems
}

export function evaluateExpressionTree(node) {
  if (node.invalid) {
    return null
  } else if (node.value != null) {
    return node.value.trim()
  } else {
    const evaluatedArguments = node.arguments.map((argument) => evaluateExpressionTree(argument))
    const result = comparisonOperators[node.operator].eval(... evaluatedArguments)
    return result
  }
}

export function getExpressionTree(expression) {
  expression = removeSurroundingParenthesis(expression)

  const result = {}

  if (expression.length === 0) {
    result.value = ""
    return result
  }

  for (let currentIndex = 0; currentIndex < expression.length; currentIndex++) {
    const char = expression[currentIndex]
    if (char === "(") {
      const closingIndex = getClosingBracket(expression, "(", ")", currentIndex - 1)
      if (closingIndex < 0) {
        // parentheses are open-ended, like "(a == b"
        result.invalid = true
        break
      }
      currentIndex = closingIndex
    } else {
      let operatorSymbol = null
      let operatorIndex = -1
      for (const symbol of sortedComparisonOperatorsSymbols) {
        const index = expression.indexOf(symbol, currentIndex)
        if (index >= 0) {
          operatorSymbol = symbol
          operatorIndex = index
          break
        }
      }

      if (operatorSymbol == null) {
        result.value = expression
        break
      }

      const operator = comparisonOperators[operatorSymbol]

      if (result.operator == null) {
        const lefthand = expression.substring(0, operatorIndex)
        const righthand = expression.substring(operatorIndex + operatorSymbol.length)

        result.operator = operatorSymbol
        result.arguments = []

        if (["binary", "unary-right"].includes(operator.type)) {
          if (lefthand.length > 0) {
            result.arguments.push(getExpressionTree(lefthand))
          } else {
            result.invalid = true
            break
          }
        }
        if (["binary", "unary-left"].includes(operator.type)) {
          if (righthand.length > 0) {
            result.arguments.push(getExpressionTree(righthand))
          } else {
            result.invalid = true
            break
          }
        }

        break
      }
    }
  }

  return result
}
