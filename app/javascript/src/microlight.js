/* eslint-disable */

/**
 * @fileoverview microlight - syntax highlightning library
 * @version 0.0.7
 *
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2016 asvd <heliosframework@gmail.com>
 *
 * Code structure aims at minimizing the compressed library size
 */

export async function reset(cls) {
  // for better compression
  var _window = window,
    _document = document,
    appendChild = 'appendChild',
    test = 'test',
    brace = ')',

    i,
    j,
    microlighted,
    el;  // current microlighted element to run through
    
  // nodes to highlight
  microlighted = _document.getElementsByClassName(cls || 'microlight');

  for (i = 0; el = microlighted[i++];) {
    const fullText = el.textContent
    const splitText = fullText.split(/(\n)/)
    const batchedArray = []

    // Merge each 100 lines in to a single string
    while (splitText.length > 0) {
      batchedArray.push(splitText.splice(0, 100).join(""))
    }

    el.innerHTML = ""

    for (j = 0; j < batchedArray.length; j++) {
      // Wait a bit to give the previous line proper time to compute
      await new Promise(resolve => setTimeout(resolve))

      var text = batchedArray[j],
        pos = 0,       // current position
        next1 = batchedArray[j][0], // next character
        chr = 1,       // current character
        prev1,           // previous character
        prev2,           // the one before the previous
        token = '',  // (and cleaning the node)

        // current token type:
        //  0: anything else (whitespaces / newlines)
        //  1: operator or brace
        //  2: closing braces (after which '/' is division not regex)
        //  3: (key)word
        //  4: numbers
        //  5: string starting with "
        //  6: string starting with '
        //  7: xml comment  <!-- -->
        //  8: multiline comment /* */
        //  9: single-line comment starting with two slashes //
        // 10: single-line comment starting with hash #
        tokenType = 0,

        // kept to determine between regex and division
        lastTokenType,
        // flag determining if token is multi-character
        multichar,
        node

      // running through characters and highlighting
      while (prev2 = prev1,
      // escaping if needed (with except for comments)
      // pervious character will not be therefore
      // recognized as a token finalize condition
      prev1 = tokenType < 6 && prev1 == '\\' ? 1 : chr
      ) {
        chr = next1;
        next1 = batchedArray[j][++pos];
        multichar = token.length > 1;

        // checking if current token should be finalized
        if (!chr || // end of content
          // types 9-10 (single-line comments) end with a
          // newline
          (tokenType > 8 && chr == '\n') ||
          [ // finalize conditions for other token types
            // 0: whitespaces
            /\S/[test](chr),  // merged together
            // 1: operators
            1,                // consist of a single character
            // 2: braces
            1,                // consist of a single character
            // 3: (key)word
            !/[$\w]/[test](chr),
            // 4: number
            !/[$\w]/[test](chr),
            // 5: string with "
            prev1 == '"' && multichar,
            // 7: xml comment
            text[pos - 4] + prev2 + prev1 == '-->',
            // 8: multiline comment
            prev2 + prev1 == '*/'
          ][tokenType]
        ) {
          // appending the token to the result
          if (token) {
            // remapping token type into style
            // (some types are highlighted similarly)
            
            el[appendChild](
              node = _document.createElement('span')
            ).setAttribute('class', [
              // 0: not formatted
              "",
              // 1: keywords
              "keyword",
              // 2: punctuation
              "punctuation",
              // 3: strings and regexps
              "string",
              // 4: comments
              "comment",
              // 5: number
              "number"
            ][
            // not formatted
            !tokenType ? 0 :
              tokenType == 4 ? 5 :
                // punctuation
                tokenType <= 2 ? 2 :
                  // comments
                  tokenType >= 6 ? 4 :
                    // regex and strings
                    tokenType >= 5 ? 3 :
                      // otherwise tokenType == 3, (key)word
                      // (1 if regexp matches, 0 otherwise)
                      + /^(variables|subroutines|rule|disabled|event|actions|conditions|global|player|settings)$/[test](token)
            ]);

            node[appendChild](_document.createTextNode(token));
          }

          // saving the previous token type
          // (skipping whitespaces and comments)
          lastTokenType =
            (tokenType && tokenType < 6) ?
              tokenType : lastTokenType;

          // initializing a new token
          token = '';

          // determining the new token type (going up the
          // list until matching a token type start
          // condition)
          tokenType = 9;
          while (![
            1,                   //  0: whitespace
            //  1: operator or braces
            /[\/{}[(\-+*=<>:;|\\.,?!&@~]/[test](chr),
            /[\])]/[test](chr),  //  2: closing brace
            /[$\w]/[test](chr),  //  3: (key)word
            /^\d+$/[test](chr),  //  4: number
            chr == '"',          //  5: string with "
            //  6: xml comment
            chr + next1 + text[pos + 1] + batchedArray[j][pos + 2] == '<!--',
            chr + next1 == '/*',   //  7: multiline comment
            chr + next1 == '//',   //  8: single-line comment
            chr == '#',          // 9: hash-style comment
          ][--tokenType]);
        }

        token += chr;
      }
    }
  }
}
