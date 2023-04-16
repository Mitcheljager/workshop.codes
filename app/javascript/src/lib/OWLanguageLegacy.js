import { HighlightStyle } from "@codemirror/language"
import { tags } from "@lezer/highlight"

export const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--color-keyword)" },
  { tag: tags.operator, color: "var(--color-operator)" },
  { tag: tags.variableName, color: "var(--color-variable)" },
  { tag: tags.string, color: "var(--color-string)" },
  { tag: tags.bool, color: "var(--color-bool)" },
  { tag: tags.attributeValue, color: "var(--color-value)" },
  { tag: tags.number, color: "var(--color-number)" },
  { tag: tags.labelName, color: "var(--color-action)" },
  { tag: tags.punctuation, color: "var(--color-punctuation)" },
  { tag: tags.invalid, color: "var(--color-invalid)" },
  { tag: tags.comment, color: "var(--color-comment)" },
  { tag: tags.atom, color: "var(--color-custom-keyword)" }
])

function wordSet(words) {
  const set = {}
  for (let i = 0; i < words.length; i++) set[words[i]] = true
  return set
}

const keywords = wordSet(["variables", "subroutines", "disabled", "event", "rule", "actions", "conditions", "settings"])
const actions = wordSet(["Abort", "Abort If", "Abort If Condition Is False", "Abort If Condition Is True", "Add Health Pool To Player", "Allow Button", "Apply Impulse", "Attach Players", "Big Message", "Break", "Call Subroutine", "Cancel Primary Action", "Chase Global Variable At Rate", "Chase Global Variable Over Time", "Chase Player Variable At Rate", "Chase Player Variable Over Time", "Clear Status", "Communicate", "Continue", "Create Beam Effect", "Create Dummy Bot", "Create Effect", "Create HUD Text", "Create Icon", "Create In-World Text", "Create Progress Bar HUD Text", "Create Progress Bar In-World Text", "Create Projectile", "Create Projectile Effect", "Create Homing Projectile", "Damage", "Declare Match Draw", "Declare Player Victory", "Declare Round Draw", "Declare Round Victory", "Declare Team Victory", "Destroy All Dummy Bots", "Destroy All Effects", "Destroy All HUD Text", "Destroy All Icons", "Destroy All In-World Text", "Destroy All Progress Bar HUD Text", "Destroy All Progress Bar In-World Text", "Destroy Dummy Bot", "Destroy Effect", "Destroy HUD Text", "Destroy Icon", "Destroy In-World Text", "Destroy Progress Bar HUD Text", "Destroy Progress Bar In-World Text", "Detach Players", "Disable Built-In Game Mode Announcer", "Disable Built-In Game Mode Completion", "Disable Built-In Game Mode Music", "Disable Built-In Game Mode Respawning", "Disable Built-In Game Mode Scoring", "Disable Death Spectate All Players", "Disable Death Spectate Target HUD", "Disable Game Mode HUD", "Disable Game Mode In-World UI", "Disable Hero HUD", "Disable Inspector Recording", "Disable Kill Feed", "Disable Messages", "Disable Movement Collision With Environment", "Disable Movement Collision With Players", "Disable Nameplates", "Disable Scoreboard", "Disable Text Chat", "Disable Voice Chat", "Disallow Button", "Else", "Else If", "Enable Built-In Game Mode Announcer", "Enable Built-In Game Mode Completion", "Enable Built-In Game Mode Music", "Enable Built-In Game Mode Respawning", "Enable Built-In Game Mode Scoring", "Enable Death Spectate All Players", "Enable Death Spectate Target HUD", "Enable Game Mode In-World UI", "Enable Hero HUD", "Enable Inspector Recording", "Enable Kill Feed", "Enable Messages", "Enable Movement Collision With Environment", "Enable Movement Collision With Players", "Enable Nameplates", "Enable Scoreboard", "Enable Text Chat", "Enable Voice Chat", "Enabled Game Mode HUD", "End", "For Global Variable", "For Player Variable", "Go To Assemble Heroes", "Heal", "If", "Kill", "Log To Inspector", "Loop", "Loop If", "Loop If Condition Is False", "Loop If Condition Is True", "Modify Global Variable", "Modify Global Variable At Index", "Modify Player Score", "Modify Player Variable", "Modify Player Variable At Index", "Modify Team Score", "Move Player To Team", "Pause Match Time", "Play Effect", "Preload Hero", "Press Button", "Remove All Health Pools From Player", "Remove Health Pool From Player", "Remove Player", "Reset Player Hero Availability", "Respawn", "Restart Match", "Resurrect", "Return To Lobby", "Set Ability 1 Enabled", "Set Ability 2 Enabled", "Set Ability Charge", "Set Ability Cooldown", "Set Ability Resource", "Set Aim Speed", "Set Ammo", "Set Crouch Enabled", "Set Damage Dealt", "Set Damage Received", "Set Environment Credit Player", "Set Facing", "Set Global Variable", "Set Global Variable At Index", "Set Gravity", "Set Healing Dealt", "Set Healing Received", "Set Invisible", "Set Jump Enabled", "Set Jump Vertical Speed", "Set Knockback Dealt", "Set Knockback Received", "Set Match Time", "Set Max Ammo", "Set Max Health", "Set Melee Enabled", "Set Move Speed", "Set Objective Description", "Set Player Allowed Heroes", "Set Player Health", "Set Player Score", "Set Player Variable", "Set Player Variable At Index", "Set Primary Fire Enabled", "Set Projectile Gravity", "Set Projectile Speed", "Set Reload Enabled", "Set Respawn Max Time", "Set Secondary Fire Enabled", "Set Slow Motion", "Set Status", "Set Team Score", "Set Ultimate Ability Enabled", "Set Ultimate Charge", "Set Weapon", "Skip", "Skip If", "Small Message", "Start Accelerating", "Start Assist", "Start Camera", "Start Damage Modification", "Start Damage Modification", "Start Damage Over Time", "Start Facing", "Start Forcing Dummy Bot Name", "Start Forcing Player Outlines", "Start Forcing Player Position", "Start Forcing Player To Be Hero", "Start Forcing Spawn Room", "Start Forcing Throttle", "Start Game Mode", "Start Heal Over Time", "Start Holding Button", "Start Modifying Hero Voice Lines", "Start Rule", "Start Scaling Barriers", "Start Scaling Player", "Start Throttle In Direction", "Start Transforming Throttle", "Stop Accelerating", "Stop All Assists", "Stop All Damage Modifications", "Stop All Damage Over Time", "Stop All Heal Over Time", "Stop All Healing Modifications", "Stop Assist", "Stop Camera", "Stop Chasing Global Variable", "Stop Chasing Player Variable", "Stop Damage Modification", "Stop Damage Over Time", "Stop Facing", "Stop Forcing Dummy Bot Name", "Stop Forcing Player Outlines", "Stop Forcing Player Position", "Stop Forcing Player To Be Hero", "Stop Forcing Spawn Room", "Stop Forcing Throttle", "Stop Heal Over Time", "Stop Healing Modification", "Stop Holding Button", "Stop Modifying Hero Voice Lines", "Stop Scaling Barriers", "Stop Scaling Player", "Stop Throttle In Direction", "Stop Transforming Throttle", "Teleport", "Unpause Match Time", "Wait", "Wait Until", "While"])
const values = wordSet(["Mixin", "For", "Global", "Ability Charge", "Ability Cooldown", "Ability Icon String", "Ability Resource", "Absolute Value", "All Damage Heroes", "All Dead Players", "All Heroes", "All Living Players", "All Players", "All Players Not On Objective", "All Players On Objective", "All Support Heroes", "All Tank Heroes", "Allowed Heroes", "Altitude Of", "Ammo", "And", "Angle Between Vectors", "Angle Difference", "Append To Array", "Arccosine In Degrees", "Arccosine In Radians", "Arcsine In Degrees", "Arcsine In Radians", "Arctangent In Degrees", "Arctangent In Radians", "Array", "Array Contains", "Array Slice", "Assist Count", "Attacker", "Backward", "Button", "Char In String", "Closest Player To", "Color", "Compare", "Control Mode Scoring Percentage", "Control Mode Scoring Team", "Cosine From Degrees", "Cosine From Radians", "Count Of", "Cross Product", "Current Array Element", "Current Array Index", "Current Game Mode", "Current Map", "Custom Color", "Custom String", "Damage Modification Count", "Damage Over Time Count", "Direction From Angles", "Direction Towards", "Distance Between", "Divide", "Dot Product", "Down", "Empty Array", "Entity Count", "Entity Exists", "Evaluate Once", "Event Ability", "Event Damage", "Event Direction", "Event Healing", "Event Player", "Event Was Critical Hit", "Event Was Environment", "Event Was Health Pack", "Eye Position", "Facing Direction Of", "Farthest Player From", "Filtered Array", "First Of", "Flag Position", "Forward", "Game Mode", "Global", "Global Variable", "Has Spawned", "Has Status", "Heal Over Time Count", "Healee", "Healer", "Healing Modification Count", "Health", "Health of Type", "Hero", "Hero Being Duplicated", "Hero Icon String", "Hero Of", "Horizontal Angle From Direction", "Horizontal Angle Towards", "Horizontal Facing Angle Of", "Horizontal Speed Of", "Host Player", "Icon String", "If-Then-Else", "Index Of Array Value", "Index Of String Char", "Input Binding String", "Is Alive", "Is Assembling Heroes", "Is Between Rounds", "Is Button Held", "Is CTF Mode In Sudden Death", "Is Communicating", "Is Communicating Any", "Is Communicating Any Emote", "Is Communicating Any Spray", "Is Communicating Any Voice line", "Is Control Mode Point Locked", "Is Crouching", "Is Dead", "Is Dummy Bot", "Is Duplicating", "Is Firing Primary", "Is Firing Secondary", "Is Flag At Base", "Is Flag Being Carried", "Is Game In Progress", "Is Hero Being Played", "Is In Air", "Is In Alternate Form", "Is In Line of Sight", "Is In Setup", "Is In Spawn Room", "Is In View Angle", "Is Jumping", "Is Match Complete", "Is Meleeing", "Is Moving", "Is Objective Complete", "Is On Ground", "Is On Objective", "Is On Wall", "Is Portrait On Fire", "Is Reloading", "Is Standing", "Is Team On Defense", "Is Team On Offense", "Is True For All", "Is True For Any", "Is Using Ability 1", "Is Using Ability 2", "Is Using Ultimate", "Is Waiting For Players", "Last Assist ID", "Last Created Entity", "Last Created Health Pool", "Last Damage Modification ID", "Last Damage Over Time ID", "Last Heal Over Time ID", "Last Healing Modification ID", "Last Of", "Last Text ID", "Left", "Local Player", "Local Vector Of", "Magnitude Of", "Map", "Match Round", "Match Time", "Max", "Max Ammo", "Max Health", "Max Health of Type", "Min", "Modulo", "Multiply", "Nearest Walkable Position", "Normalize", "Normalized Health", "Not", "Null", "Number of Dead Players", "Number of Deaths", "Number of Eliminations", "Number of Final Blows", "Number of Heroes", "Number of Living Players", "Number of Players", "Number of Players On Objective", "Number of Slots", "Objective Index", "Objective Position", "Opposite Team Of", "Or", "Payload Position", "Payload Progress Percentage", "Player Carrying Flag", "Player Closest To Reticle", "Player Hero Stat", "Player Stat", "Player Variable", "Players In Slot", "Players On Hero", "Players Within Radius", "Players in View Angle", "Point Capture Percentage", "Position Of", "Raise To Power", "Random Integer", "Random Real", "Random Value In Array", "Randomized Array", "Ray Cast Hit Normal", "Ray Cast Hit Player", "Ray Cast Hit Position", "Remove From Array", "Right", "Round To Integer", "Score Of", "Server Load", "Server Load Average", "Server Load Peak", "Sine From Degrees", "Sine From Radians", "Slot Of", "Sorted Array", "Mapped Array", "Spawn Points", "Speed Of", "Speed Of In Direction", "Square Root", "String", "String Contains", "String Length", "String Replace", "String Slice", "String Split", "Subtract", "Tangent From Degrees", "Tangent From Radians", "Team Of", "Team Score", "Text Count", "Throttle Of", "Total Time Elapsed", "Ultimate Charge Percent", "Up", "Update Every Frame", "Value In Array", "Vector", "Vector Towards", "Velocity Of", "Vertical Angle From Direction", "Vertical Angle Towards", "Vertical Facing Angle Of", "Vertical Speed Of", "Victim", "Weapon", "Workshop Setting Combo", "Workshop Setting Hero", "Workshop Setting Integer", "Workshop Setting Real", "Workshop Setting Toggle", "World Vector Of", "X Component Of", "Y Component Of", "Z Component Of", "Damage", "Heal"])
const bools = wordSet(["True", "False"])
const operators = "+-/*%=|&<>~^?!"
const customOperators = wordSet(["is", "not", "equals", "test", "through", "from", "to"])
const punc = ":;,.(){}[]+-\\*"
const octal = /^\-?0o[0-7][0-7_]*/
const hexadecimal = /^\-?0x[\dA-Fa-f][\dA-Fa-f_]*(?:(?:\.[\dA-Fa-f][\dA-Fa-f_]*)?[Pp]\-?\d[\d_]*)?/
const decimal = /^\-?\d[\d_]*(?:\.\d[\d_]*)?(?:[Ee]\-?\d[\d_]*)?/
const identifier = /^\$\d+|(`?)[_A-Za-z][_A-Za-z$0-9]*\1/
const actionsValuesIdentifier = /^\s*(?=[A-Z])\b[A-Z][\w\s-]*/g
const phraseIdentifier = /^\s*(?=[A-Z]).+?(?= [+\-*%=|&<>~^?!]|[\(\)\{\}:;,./\n\[\]]|\s==)/
const customKeywords = /(?<!\w)@\w+/

function tokenBase(stream, state) {
  if (stream.sol()) state.indented = stream.indentation()
  if (stream.eatSpace()) return null

  const ch = stream.peek()
  if (ch == "/") {
    if (stream.match("//")) {
      stream.skipToEnd()
      return "comment"
    }

    if (stream.match("/*")) {
      state.tokenize.push(tokenComment)
      return tokenComment(stream, state)
    }
  }

  if (stream.match(octal)) return "number"
  if (stream.match(hexadecimal)) return "number"
  if (stream.match(decimal)) return "number"
  if (stream.match(customKeywords)) return "atom"

  if (operators.indexOf(ch) > -1) {
    stream.next()
    return "operator"
  }

  if (punc.indexOf(ch) > -1) {
    stream.next()
    stream.match("..")
    return "punctuation"
  }

  let stringMatch
  if (stringMatch = stream.match(/("""|"|')/)) {
    const tokenize = tokenString.bind(null, stringMatch[0])
    state.tokenize.push(tokenize)
    return tokenize(stream, state)
  }

  if (stream.match(actionsValuesIdentifier)) {
    const ident = stream.current()
    if (actions.hasOwnProperty(ident)) return "labelName"
    if (values.hasOwnProperty(ident)) return "attributeValue"
    return "variable"
  }

  if (stream.match(phraseIdentifier)) {
    const ident = stream.current()
    if (values.hasOwnProperty(ident)) return "attributeValue"
    if (keywords.hasOwnProperty(ident)) return "keyword"
    if (bools.hasOwnProperty(ident)) return "bool"
    return "variable"
  }

  if (stream.match(identifier)) {
    const ident = stream.current()
    if (keywords.hasOwnProperty(ident)) return "keyword"
    if (customOperators.hasOwnProperty(ident)) return "atom"
    return "variable"
  }

  stream.next()
  return null
}

function tokenUntilClosingParen() {
  let depth = 0
  return function(stream, state, prev) {
    const inner = tokenBase(stream, state, prev)
    if (inner == "punctuation") {
      if (stream.current() == "(") ++depth
      else if (stream.current() == ")") {
        if (depth == 0) {
          stream.backUp(1)
          state.tokenize.pop()
          return state.tokenize[state.tokenize.length - 1](stream, state)
        }
        else --depth
      }
    }
    return inner
  }

}

function tokenString(openQuote, stream, state) {
  const singleLine = openQuote.length == 1
  let ch, escaped = false
  while (ch = stream.peek()) {
    if (escaped) {
      stream.next()
      if (ch == "(") {
        state.tokenize.push(tokenUntilClosingParen())
        return "string"
      }
      escaped = false
    } else if (stream.match(openQuote)) {
      state.tokenize.pop()
      return "string"
    } else {
      stream.next()
      escaped = ch == "\\"
    }
  }
  if (singleLine) {
    state.tokenize.pop()
  }
  return "string"
}

function tokenComment(stream, state) {
  let ch
  while (ch = stream.next()) {
    if (ch === "/" && stream.eat("*")) {
      state.tokenize.push(tokenComment)
    } else if (ch === "*" && stream.eat("/")) {
      state.tokenize.pop()
      break
    }
  }
  return "comment"
}

function Context(prev, align, indented) {
  this.prev = prev
  this.align = align
  this.indented = indented
}

function pushContext(state, stream) {
  const align = stream.match(/^\s*($|\/[\/\*]|[)}\]])/, false) ? null : stream.column() + 1
  state.context = new Context(state.context, align, state.indented)
}

function popContext(state) {
  if (state.context) {
    state.indented = state.context.indented
    state.context = state.context.prev
  }
}

export const OWLanguage = {
  startState: function() {
    return {
      prev: null,
      context: null,
      indented: 0,
      tokenize: []
    }
  },

  token: function(stream, state) {
    const prev = state.prev
    state.prev = null
    const tokenize = state.tokenize[state.tokenize.length - 1] || tokenBase
    const style = tokenize(stream, state, prev)
    if (!style || style == "comment") state.prev = prev
    else if (!state.prev) state.prev = style

    if (style == "punctuation") {
      const bracket = /[\(\[\{]|([\]\)\}])/.exec(stream.current())
      if (bracket) (bracket[1] ? popContext : pushContext)(state, stream)
    }

    return style
  },

  indent: function(state, textAfter, iCx) {
    const cx = state.context
    if (!cx) return 0
    const closing = /^[\]\}\)]/.test(textAfter)
    if (cx.align != null) return cx.align - (closing ? 1 : 0)
    return cx.indented + (closing ? 0 : iCx.unit)
  },

  languageData: {
    indentOnInput: /^\s*[\)\}\]]$/,
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    closeBrackets: { brackets: ["(", "[", "{", "'", "\"", "`"] }
  }
}
