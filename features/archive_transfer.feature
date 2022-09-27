Feature: Transferring archive posts

  As a legacy user of workshop.elohell.gg
  So that I can utilize my work from the legacy site
  I want to be able to transfer an archive post to my account

  Background: Some accounts and a post
    Given a normal user named "elo-hell-archive"
    * a post by elo-hell-archive titled "Junkertown Treasure Hunt"
    * a normal user named "Junker_Queen"
    * a Battle.net account "Junker_Queen#0034" with ID 1234567890

  Scenario: Direct Battle.net user can transfer post
    Given I am logged in with my Battle.net account
    And a legacy authorization for the post titled "Junkertown Treasure Hunt" and user ID 1234567890
    When I try to transfer the archive post titled "Junkertown Treasure Hunt"
    Then I should own the post titled "Junkertown Treasure Hunt"

  Scenario: Normal user with correct linked account can transfer post
    Given a legacy authorization for the post titled "Junkertown Treasure Hunt" and user ID 1234567890
    And I am logged in as Junker_Queen
    And I link my Battle.net account
    When I try to transfer the archive post titled "Junkertown Treasure Hunt"
    Then I should own the post titled "Junkertown Treasure Hunt"

  Scenario: Temporarily authorized user sees notice to create account
    Given a legacy authorization for the post titled "Junkertown Treasure Hunt" and user ID 1234567890
    When I visit the archive actions page for the post titled "Junkertown Treasure Hunt"
    And I click the Authenticate with Battle.net button
    Then I should see "Transfer Post"
    And I should see "You must be logged into a Workshop.codes account in order to transfer this post to yourself."

  Scenario: Lack of authorization prevents transfer of post
    Given I am logged in as Junker_Queen
    And I link my Battle.net account
    When I visit the archive actions page for the post titled "Junkertown Treasure Hunt"
    Then I should see a notification saying "This post is not an archive post"

  Scenario: Incorrect authorization prevents reaching actions page
    Given a legacy authorization for the post titled "Junkertown Treasure Hunt" and user ID 9876543210
    When I am logged in with my Battle.net account
    And I visit the archive actions page for the post titled "Junkertown Treasure Hunt"
    Then I should see "Your current Workshop.codes account is not associated with the Battle.net account which originally created this post."
    When I click the Authenticate with Battle.net button
    Then I should see "You are not authorized to take action on this archive post."
