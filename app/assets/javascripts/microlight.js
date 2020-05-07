/**
 * @fileoverview microlight - syntax highlightning library
 * @version 0.0.7
 *
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2016 asvd <heliosframework@gmail.com>
 *
 * Code structure aims at minimizing the compressed library size
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.microlight = {}));
    }
}(this, function (exports) {
    // for better compression
    var _window       = window,
        _document     = document,
        appendChild   = 'appendChild',
        test          = 'test',
        brace         = ')',

        i,
        microlighted,
        el;  // current microlighted element to run through



    var reset = function(cls) {
        // nodes to highlight
        microlighted = _document.getElementsByClassName(cls||'microlight');

        for (i = 0; el = microlighted[i++];) {
            var text  = el.textContent,
                pos   = 0,       // current position
                next1 = text[0], // next character
                chr   = 1,       // current character
                prev1,           // previous character
                prev2,           // the one before the previous
                token =          // current token content
                el.innerHTML = '',  // (and cleaning the node)

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
                   prev1 = tokenType < 7 && prev1 == '\\' ? 1 : chr
            ) {
                chr = next1;
                next1=text[++pos];
                multichar = token.length > 1;

                // checking if current token should be finalized
                if (!chr  || // end of content
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
                        // 6: string with '
                        prev1 == "'" && multichar,
                        // 7: xml comment
                        text[pos-4]+prev2+prev1 == '-->',
                        // 8: multiline comment
                        prev2+prev1 == '*/'
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
                            '',
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
                            tokenType >= 7 ? 4 :
                            // regex and strings
                            tokenType >= 5 ? 3 :
                            // otherwise tokenType == 3, (key)word
                            // (1 if regexp matches, 0 otherwise)
                            + /^(variables|subroutines|rule|event|actions|conditions|global|player|settings)$/[test](token)
                        ]);

                        node[appendChild](_document.createTextNode(token));
                    }

                    // saving the previous token type
                    // (skipping whitespaces and comments)
                    lastTokenType =
                        (tokenType && tokenType < 7) ?
                        tokenType : lastTokenType;

                    // initializing a new token
                    token = '';

                    // determining the new token type (going up the
                    // list until matching a token type start
                    // condition)
                    tokenType = 10;
                    while (![
                        1,                   //  0: whitespace
                                             //  1: operator or braces
                        /[\/{}[(\-+*=<>:;|\\.,?!&@~]/[test](chr),
                        /[\])]/[test](chr),  //  2: closing brace
                        /[$\w]/[test](chr),  //  3: (key)word
                        /^\d+$/[test](chr),  //  4: number
                        chr == '"',          //  5: string with "
                        chr == "'",          //  6: string with '
                                             //  7: xml comment
                        chr+next1+text[pos+1]+text[pos+2] == '<!--',
                        chr+next1 == '/*',   //  8: multiline comment
                        chr+next1 == '//',   //  9: single-line comment
                        chr == '#',          // 10: hash-style comment
                    ][--tokenType]);
                }

                token += chr;
            }
        }
    }

    exports.reset = reset;

    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window.addEventListener('load', function(){reset()}, 0);
    }
}));
