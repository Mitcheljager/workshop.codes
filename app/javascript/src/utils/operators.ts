export const comparisonOperators = {
  "!": {
    type: "unary-left",
    order: -1,
    eval: (v: string) => !v
  },
  "==": {
    type: "binary",
    order: 0,
    eval: (l: string, r: string) => l === r
  },
  "!=": {
    type: "binary",
    order: 0,
    eval: (l: string, r: string) => l !== r
  },
  "*=": {
    type: "binary",
    order: 0,
    eval: (l: string, r: string) => l.includes(r)
  },
  "~=": {
    type: "binary",
    order: 0,
    _regexRegex: /^\/(.+)\/(\w*)$/,
    eval(l: string, r: string) {
      const match = r.match(this._regexRegex)
      if (!match) {
        return false
      }
      const [_, pattern, flags] = match
      let regex
      try {
        regex = new RegExp(pattern, flags)
      } catch (err) {
        return false
      }
      return regex.test(l)
    }
  },
  "&&": {
    type: "binary",
    order: 1,
    eval: (l: string, r: string) => l && r
  },
  "||": {
    type: "binary",
    order: 1,
    eval: (l: string, r: string) => l || r
  }
}

export const sortedComparisonOperatorsSymbols = Object.keys(comparisonOperators)
  .sort((a, b) => {
    // sort descending by order, so higher order operators are matched first
    // and the evaluation works with normal logic
    // @ts-ignore
    const orderRank = comparisonOperators[b].order - comparisonOperators[a].order
    if (orderRank === 0) {
      // sort descending by length, so longer operators are matched first
      // and we don't potentially skip the shorter ones
      const lengthRank = b.length - a.length
      return lengthRank
    } else {
      return orderRank
    }
  })
