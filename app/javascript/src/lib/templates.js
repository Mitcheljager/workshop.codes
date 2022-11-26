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
  Mixin: `// Mixins allow you to re-use a bit of code in any place you wish
// They are declared using "@mixin mixinName()"
@mixin mixinName()
{
	Global.value = 1;
}

// They can be included in any location using "@include mixinName()"
@include mixinName();

// See more examples at https://workshop.codes/editor?uuid=7013aa4b-4611-4f73-b1e1-6fca1bb2c771`,
  Empty: ""
})
