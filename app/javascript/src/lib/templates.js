export const templates = Object.freeze({
  RuleGlobal: `rule("Rule Name")
{
  event
  {
    Ongoing - Global;
  }

  conditions
  {

  }

  actions
  {

  }
}`,
  RuleEachPlayer: `rule("Rule Name")
{
  event
  {
    Ongoing - Each Player;
    All;
    All;
  }

  conditions
  {

  }

  actions
  {

  }
}`,
  Subroutine: `rule("Rule Name")
{
  event
  {
    Subroutine;
    YourSubroutineName;
  }

  actions
  {

  }
}`,
  Settings: `settings
{
  main
  {
    Description: "Description of your mode (Made using the Workshop.codes script editor)"
    Mode Name: "Name of your mode"
  }

  lobby
  {
    Allow Players Who Are In Queue: Yes
    Match Voice Chat: Enabled
  }

  modes
  {
    Skirmish
    {
      enabled maps
      {
        Workshop Island 0
      }
    }

    General
    {
    }
  }
}`,
  Empty: ""
})
