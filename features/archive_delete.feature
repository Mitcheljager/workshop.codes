Feature: Deleting archive posts

  As a legacy user of workshop.elohell.gg
  So that I can easily remove my data from Workshop.codes
  I want to be able to delete an archive post

  Background: Some accounts and a post
    Given a normal user named "elo-hell-archive"
    * a post by elo-hell-archive titled "Monetization Anxieties"
    * a normal user named "OW_Playerbase"
    * a Battle.net account "OW_Playerbase#0002" with ID 1234567890

  Scenario: Direct Battle.net user can delete post
    Given a legacy authorization for the post titled "Monetization Anxieties" and user ID 1234567890
    And I am logged in with my Battle.net account
    When I try to delete the archive post titled "Monetization Anxieties"
    Then there should not be a post titled "Monetization Anxieties"

  Scenario: Normal user with correct linked account can delete post
    Given a legacy authorization for the post titled "Monetization Anxieties" and user ID 1234567890
    And I am logged in as OW_Playerbase
    And I link my Battle.net account
    When I try to delete the archive post titled "Monetization Anxieties"
    Then there should not be a post titled "Monetization Anxieties"

  Scenario: Tempoarily authorized user can delete post
    Given a legacy authorization for the post titled "Monetization Anxieties" and user ID 1234567890
    When I try to delete the archive post titled "Monetization Anxieties"
    Then there should not be a post titled "Monetization Anxieties"
