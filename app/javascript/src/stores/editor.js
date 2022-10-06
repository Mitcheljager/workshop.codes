import { writable } from "svelte/store"

export const currentItemIndex = writable(0)

export const items = writable([
  {
    name: "Settings",
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
  }
])
