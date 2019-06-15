function createStrings() {
  let matches = content[currentContent].match(/\".*?\"/g)
  matches = Array.from(new Set(matches))
  const cssClass = "syntax-highlight syntax-highlight--green"

  if (!matches) return

  matches.forEach(match => {
    content[currentContent] = content[currentContent].replace(match, `<span class="${ cssClass }">${ match }</span>`)
  })
}

function createSimple(string, color) {
  const cssClass = `syntax-highlight syntax-highlight--${ color }`
  content[currentContent] = content[currentContent].replace(new RegExp(string, "g"), `<span class="${ cssClass }">${ string }</span>`)
}

function createNumbers(element) {
  let matches = content[currentContent].match(/\d+\.?\d*/g)

  matches = Array.from(new Set(matches))
  const cssClass = "syntax-highlight syntax-highlight--orange"

  if (!matches) return

  matches.forEach(match => {
    content[currentContent] = content[currentContent].replace(new RegExp(match, "g"), `<span class="${ cssClass }">${ match }</span>`)
  })
}

function createVariables(element) {
  // let regex = /\b[A-Z]{1}\b/gm
  // const cssClass = "syntax-highlight syntax-highlight--white"
  //
  // let toChange = []
  //
  //
  // while (match = regex.exec(content[currentContent])) {
  //   toChange[match.index]
  // }
  //
  // USE THE ARRAY
  //
  // let x = ""
  // x = replaceAt(content[currentContent], match.index, replacement)
  // // const replacement = `<span class="${ cssClass }">${ match[0] }</span>`
  //
  // console.log(x)
  //
  // content[currentContent] = x
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function removeChilds(element) {
  const elements = element.querySelectorAll("span.syntax-highlight span.syntax-highlight")

  elements.forEach(element => element.className = "")
}



function syntaxHighlight(element) {
  const simples = {
    "True": "orange",
    "False": "orange",
    "Null": "orange",

    "Event Player": "cyan",
    "All Players": "cyan",
    "Each Player": "cyan",
    "All Teams": "cyan",

    "Ability 1 Enabled": "red",
    "Ability 2 Enabled": "red",
    "Accelerating": "red",
    "Aim Speed": "red",
    "Big Message": "red",
    "Built-In Game Mode Announcer": "red",
    "Built-In Game Mode Completion": "red",
    "Built-In Game Mode Music": "red",
    "Built-In Game Mode Respawning": "red",
    "Built-In Game Mode Scoring": "red",
    "Camera": "red",
    "Chasing Global Variable": "red",
    "Chasing Player Variable": "red",
    "Communicate": "red",
    "Dealt": "red",
    "Over Time": "red",
    "Damage Over Time": "red",
    "Death Spectate All Players": "red",
    "Death Spectate Target Hud": "red",
    "Disallow Button": "red",
    "Effect": "red",
    "Event Player": "red",
    "Event Was Critical Hit": "red",
    "Foricng Player To Be Hero": "red",
    "Global Variable": "red",
    "Global Variable At Index": "red",
    "Global Variable At Rate": "red",
    "Global Variable Over Time": "red",
    "Globale Variable": "red",
    "Gravity": "red",
    "Heal Over Time": "red",
    "Healing Dealt": "red",
    "Healing received": "red",
    "Holding Button": "red",
    "HUD Text": "red",
    "If Condition Is False": "red",
    "If Condition Is True": "red",
    "If Condition Is True": "red",
    "Is Button Held": "red",
    "Impulse": "red",
    "In-World Text": "red",
    "Invisible": "red",
    "Ignore Condition": "red",
    "Match Draw": "red",
    "Match Time": "red",
    "Max Health": "red",
    "Move Speed": "red",
    "Objective Description": "red",
    "Player Allowed Heroes": "red",
    "Player At Be Hero": "red",
    "Player Hero Availability": "red",
    "Player Score": "red",
    "Player Took Damage": "red",
    "Player Variable": "red",
    "Player Variable At Index": "red",
    "Player Variable At Rate": "red",
    "Player Variable Over Time": "red",
    "Player Victory": "red",
    "Projectile Gravity": "red",
    "Projectile Speed": "red",
    "Respawn Max Time": "red",
    "Slow Motion": "red",
    "Small Message": "red",
    "Spawn Room": "red",
    "Team Score": "red",
    "Team Victory": "red",
    "Throttle": "red",
    "Ultimate Ability Enabled": "red",
    "Ultimate Charge": "red",

    "Ongoing - Global": "red",
    "Ongoing - Each Player": "red",
    "Player Earned Elimnation": "red",
    "PLayer Dealt FInal Blow": "red",
    "Player Dealt Damage": "red",
    "Player Took Damage": "red",
    "Player Died": "red",

    "If": "red",
    "Icon": "red",
    "Icons": "red",
    "Hero": "red",
    "Status": "red",
    "Slot": "red",
    "String": "red",
    "Team": "red",

    "rule": "red",
    "event": "red",
    "actions": "red",
    "conditions": "red",

    "Abort": "purple",
    "Add": "purple",
    "All": "purple",
    "Chase": "purple",
    "Clear": "purple",
    "Create": "purple",
    "Damage": "purple",
    "Declare": "purple",
    "Destroy": "purple",
    "Disable": "purple",
    "Divide": "purple",
    "Enable": "purple",
    "Heal": "purple",
    "If": "purple",
    "Kill": "purple",
    "Loop": "purple",
    "Multiply": "purple",
    "Pause": "purple",
    "Respawn": "purple",
    "Resurrect": "purple",
    "Set": "purple",
    "Skip": "purple",
    "Start": "purple",
    "Stop": "purple",
    "Subtract": "purple",
    "Teleport": "purple",
    "Unpause": "purple",
    "Wait": "purple",
    "When": "purple",

    "Absolute Value": "blue",
    "Add": "blue",
    "All Dead Players": "blue",
    "All Heros": "blue",
    "All Living Players": "blue",
    "All Players": "blue",
    "All Players Not On Objective": "blue",
    "All Players On Objective": "blue",
    "Allowed Heros": "blue",
    "Altitude Of": "blue",
    "And": "blue",
    "Angle Difference": "blue",
    "Append To Array": "blue",
    "Array Contains": "blue",
    "Array Slice": "blue",
    "Attacker": "blue",
    "Backward": "blue",
    "Closest Player To": "blue",
    "Compare": "blue",
    "Control Mode Scoring Percentage": "blue",
    "Control Mode Scoring Team": "blue",
    "Cosine From Radians": "blue",
    "Cosine From Degrees": "blue",
    "Count Of": "blue",
    "Cross Product": "blue",
    "Current Array Element": "blue",
    "Direction From Angles": "blue",
    "Direction Towards": "blue",
    "Distance Between": "blue",
    "Divide": "blue",
    "Dot Product": "blue",
    "Down": "blue",
    "Empty Array": "blue",
    "Entity Exists": "blue",
    "Facing Direction Of": "blue",
    "Farthest Player From": "blue",
    "Filtered Array": "blue",
    "First Of": "blue",
    "Flag Position": "blue",
    "Forward": "blue",
    "Global Variable": "blue",
    "Has Spawned": "blue",
    "Has Status": "blue",
    "Health": "blue",
    "Health Percent": "blue",
    "Hero": "blue",
    "Hero Icon STring": "blue",
    "Hero Of": "blue",
    "Horizontal Angle From Direction": "blue",
    "Horizontal Angle Towards": "blue",
    "Horizontal Facing Angle Of": "blue",
    "Horizontal Speed Of": "blue",
    "Index Of Array Value": "blue",
    "Is Alive": "blue",
    "Is Assembling Heros": "blue",
    "Is Between Rounds": "blue",
    "Is Button Held": "blue",
    "Is Communicating": "blue",
    "Is Communicating Any": "blue",
    "Is Communicating Any Emote": "blue",
    "Is Communicating Any Voice Line": "blue",
    "Is Control Mode Point Locked": "blue",
    "Is Crouching": "blue",
    "Is CTF Mode In Sudden Death": "blue",
    "Is Dead": "blue",
    "Is Firing Primary": "blue",
    "Is Firing Secondary": "blue",
    "Is Flag At Base": "blue",
    "Is Flag Being Carried": "blue",
    "Is Game In Progress": "blue",
    "Is Hero Being Played": "blue",
    "Is In Air": "blue",
    "Is In Line Of Sight": "blue",
    "Is In Setup": "blue",
    "Is In Spawn Room": "blue",
    "Is In View Angle": "blue",
    "Is Match Complete": "blue",
    "Is On Ground": "blue",
    "Is On Objective": "blue",
    "Is On Wall": "blue",
    "Is Portrait On Fire": "blue",
    "Is Standing": "blue",
    "Is Team On Defense": "blue",
    "Is Team On Offense": "blue",
    "Is True For All": "blue",
    "Is True For Any": "blue",
    "Is Using Ability 1": "blue",
    "Is Using Ability 2": "blue",
    "Is Using Ultimate": "blue",
    "Is Waiting For Players": "blue",
    "Last Created Entity": "blue",
    "Last Damage Over Time ID": "blue",
    "Last Heal Over Time ID": "blue",
    "Last Of": "blue",
    "Last Text ID": "blue",
    "Left": "blue",
    "Local Vector Of": "blue",
    "Match Round": "blue",
    "Match Time": "blue",
    "Max": "blue",
    "Max Health": "blue",
    "Min": "blue",
    "Modulo": "blue",
    "Multiply": "blue",
    "Nearest Walkable Position": "blue",
    "Normalize": "blue",
    "Not": "blue",
    "Number": "blue",
    "Number Of Dead Players": "blue",
    "Number Of Deaths": "blue",
    "Number Of Eliminations": "blue",
    "Number Of Final Blows": "blue",
    "Number Of Heros": "blue",
    "Number Of Living Players": "blue",
    "Number Of Players": "blue",
    "Number Of Players On Objective": "blue",
    "Objective Index": "blue",
    "Objective Position": "blue",
    "Opposite Team Of": "blue",
    "Or": "blue",
    "Of": "blue",
    "Payload Position": "blue",
    "Payload Progress Percentage": "blue",
    "Player Carrying Flag": "blue",
    "Player Closest To Reticle": "blue",
    "Player Variable": "blue",
    "Players In Slot": "blue",
    "Players In View Angle": "blue",
    "Players On Hero": "blue",
    "Players Within Radius": "blue",
    "Point Capture Percentage": "blue",
    "Position Of": "blue",
    "Raise To Power": "blue",
    "Random Integer": "blue",
    "Random Real": "blue",
    "Random Value In Array": "blue",
    "Randomized Array": "blue",
    "Right": "blue",
    "Round Of Integer": "blue",
    "Score Of": "blue",
    "Sine From Degrees": "blue",
    "Sine From Radians": "blue",
    "Slot Of": "blue",
    "Sorted Array": "blue",
    "Speed Of": "blue",
    "Speed Of In Direction": "blue",
    "Square Root": "blue",
    "Subtract": "blue",
    "Position": "blue",
    "Team Of": "blue",
    "Team Score": "blue",
    "Throttle Of": "blue",
    "Total Time Elapsed": "blue",
    "Ultimate Charge Percent": "blue",
    "Up": "blue",
    "Value In Array": "blue",
    "Vector": "blue",
    "Vector Towards": "blue",
    "Velocity Of": "blue",
    "Vertical Angle From Direction": "blue",
    "Vertical Angle Towards": "blue",
    "Vertical Facing Angle Of": "blue",
    "Vertical Speed Of": "blue",
    "Victim": "blue",
    "World Vector Of": "blue",
    "X Component Of": "blue",
    "Y Component Of": "blue",
    "Z Component Of": "blue",

    "Direction": "blue",

    "D.va": "white",
    "Orisa": "white",
    "Reinhardt": "white",
    "Roadhog": "white",
    "Winston": "white",
    "Wrecking Ball": "white",
    "Zarya": "white",
    "Ashe": "white",
    "Bastion": "white",
    "Doomfist": "white",
    "Genji": "white",
    "Hanzo": "white",
    "Junkrat": "white",
    "McCree": "white",
    "Mei": "white",
    "Pharah": "white",
    "Reaper": "white",
    "Soldier: 76": "white",
    "Sombra": "white",
    "Symmetra": "white",
    "Torbjörn": "white",
    "Tracer": "white",
    "Widowmaker": "white",
    "Ana": "white",
    "Baptiste": "white",
    "Brigitte": "white",
    "Lúcio": "white",
    "Mercy": "white",
    "Moira": "white",
    "Zenyatta": "white",

    "Ultimate": "white"
  }

  content[currentContent] = element.textContent

  const currentCursorPosition = getCursorPosition()

  createStrings()

  for (let key in simples) {
    createSimple(key, simples[key])
  }

  createLineCount(element)
  createVariables(element)

  element.innerHTML = content[currentContent]

  removeChilds(element)

  content[currentContent] = element.textContent

  setCurrentCursorPosition(element, currentCursorPosition)
}
