Feature: Users can link their accounts and log in with linked accounts
  As a user with many different accounts on different platforms
  So that I can log in however I want
  I want to be able to link my accounts together

  Rule: Users can link accounts to one other account
    Background: User with many potential accounts
      Given a user named "Sojourn"
      * a Battle.net account "Sojourn#12345"
      * a Discord account "Sojourn#0042"
      And I am logged in as Sojourn

    Scenario: User can link their Battle.net account
      When I try to link my Battle.net account
      Then I should see "Your Battle.net account 'Sojourn#12345' has been linked"
      And I should see "Sojourn#12345" in my linked accounts

    Scenario: User can link their Discord account
      When I try to link my Discord account
      Then I should see "Your Discord account 'Sojourn#0042' has been linked"
      And I should see "Sojourn" in my linked accounts

    Scenario: User can link an OAuth account to another OAuth account
      Given I am logged in with my Discord account
      And I try to link my Battle.net account
      Then I should see "Your Battle.net account 'Sojourn#12345' has been linked"
      And I should see "Sojourn#12345" in my linked accounts

    Scenario: User can only link an account to one other account
      Given I log in with my Discord account
      And I link my Battle.net account
      Then I log in as Sojourn
      And I try to link my Battle.net account
      Then I should see "This log in is already linked to a different account."
      And I should not see "Sojourn#121345" in my linked accounts

  Rule: Users can unlink their accounts
    Background: User has linked accounts
      Given a user named "Sojourn"
      And a linked Battle.net account "Sojourn#12345"
      And a linked Discord account "Sojourn#0042"
      And I am logged in as Sojourn

    Scenario: User can unlink their Battle.net account
      When I try to unlink my Battle.net account
      Then I should see "Account successfully unlinked"
      And I should not see "Sojourn#12345" in my linked accounts
      But I should see "Sojourn#0042" in my linked accounts

    Scenario: User can unlink their Discord account
      When I try to unlink my Discord account
      Then I should see "Account successfully unlinked"
      And I should not see "Sojourn#0042" in my linked accounts
      But I should see "Sojourn#12345" in my linked accounts

  Rule: Users can log in with their linked accounts
    Background: User has linked accounts
      Given a user named "Sojourn"
      And a Battle.net account "SojournsBnet#12345"
      And a Discord account "SojournsDiscord#0042"
      And I am logged in as Sojourn

    Scenario: User logs in with linked Discord account
      Given I link my Discord account
      And I log out
      When I log in with my Discord account
      Then I should be logged in as "Sojourn"

    Scenario: User logs in with linked Battle.net account
      Given I link my Battle.net account
      And I log out
      When I log in with my Battle.net account
      Then I should be logged in as "Sojourn"

    Scenario: User logs in with unlinked Discord account
      Given I log out
      When I log in with my Discord account
      Then I should be logged in as "SojournsDiscord"

    Scenario: User logs in with unlinked Battle.net account
      Given I log out
      When I log in with my Battle.net account
      Then I should be logged in as "SojournsBnet"
