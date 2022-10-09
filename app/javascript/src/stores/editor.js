import { writable } from "svelte/store"

export const editorStates = writable({})
export const currentItem = writable({})

export const items = writable([
  {
    name: "Settings",
    id: "asjkdnmasl",
    type: "item",
    position: 2,
    content: `settings
{
  main
  {
    Description: "Randomat! Every x seconds a new random event shakes up your round of Deathmatch. v1.13.0                                  More info at workshop.codes/randomat"
    Mode Name: "Randomat!"
  }

  lobby
  {
    Allow Players Who Are In Queue: Yes
    Match Voice Chat: Enabled
  }

  modes
  {
    Deathmatch
    {
      enabled maps
      {
        Château Guillard
        Kanezaka
        Malevento
        Petra
      }
    }

    General
    {
      Game Length In Minutes: 15
      Game Mode Start: Immediately
      Hero Limit: Off
      Score To Win: 50
    }
  }
}`
  }, {
    name: "Infinite Timer",
    id: "dd112asfa",
    parent: "ajsd09pl",
    type: "item",
    position: 2,
    content: `rule("Infinite timer")
{
  event
  {
    Ongoing - Global;
  }

  conditions
  {
    Match Time < 1800;
    Global.InfiniteGame == True;
    Is Game In Progress == True;
  }

  actions
  {
    Set Match Time(3599);
  }
}`
  }, {
    name: "Disable default game ending",
    id: "asdasf2g",
    parent: "ajsd09pl",
    type: "item",
    position: 0,
    content: `rule("Disable default game ending")
{
  event
  {
    Ongoing - Global;
  }

  conditions
  {
    Global.InfiniteGame == True;
  }

  actions
  {
    Disable Built-In Game Mode Completion;
    Disable Built-In Game Mode Announcer;
    Disable Built-In Game Mode Music;
  }
}`
  }, {
    name: "Folder that holds stuff",
    id: "ajsd09pl",
    type: "folder",
    position: 0
  }, {
    name: "Second folder that's in another",
    id: "masokldas09",
    type: "folder",
    parent: "ajsd09pl",
    position: 1
  }
])
