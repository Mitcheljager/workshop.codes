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
      Then I should see a success message
      And I should see "Sojourn#12345" on my linked accounts page

    Scenario: User can link their Discord account
      When I try to link my Discord account
      Then I should see a success message
      And I should see "Sojourn#0042" on my linked accounts page

    Scenario: User can link an OAuth account to another OAuth account
      Given I am logged in with my Discord account
      And I try to link my Battle.net account
      Then I should see a success message
      And I should see "Sojourn#12345" on my linked accounts page

    Scenario: User can only link an account to one other account
      Given my Battle.net account is linked to my Discord account
      And I try to link my Battle.net account
      Then I should see an error message
      And I should not see "Sojourn#121345" on my linked accounts page

  Rule: Users can unlink their accounts
    Background: User has linked accounts
      Given a user named "Sojourn"
      And a linked Battle.net account "Sojourn#12345"
      And a linked Discord account "Sojourn#0042"
      And I am logged in as Sojourn

    Scenario: User can unlink their Battle.net account
      When I try to unlink my Battle.net account
      Then I should see a success message
      And I should not see "Sojourn#12345" on my linked accounts page
      But I should see "Sojourn#0042"

    Scenario: User can unlink their Discord account
      When I try to unlink my Discord account
      Then I should see a success message
      And I should not see "Sojourn#0042" on my linked accounts page
      But I should see "Sojourn#12345"

  Rule: Users can log in with their linked accounts
    Background: User has linked accounts
      Given a user named "Sojourn"
      And a linked Battle.net account "Sojourn#12345"
      And a linked Discord account "Sojourn#0042"
      And I log out

    Scenario: User logs in with linked account
      When I log in with my Discord account
      Then I should be logged in as "Sojourn"

    Scenario: User logs in with unlinked account
      Given I unlink my Discord account
      When I log in with my Discord account
      Then I should be logged in as "Sojourn#0042"
