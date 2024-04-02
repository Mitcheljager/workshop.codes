@javascript
Feature: Post derivatives

  As a post creator on Workshop.codes
  So that I can credit other people's work in my post
  I want to be able to add sources to my post

  Background: Two users and two posts each
    Given a user named "OBSWinston"
    * a user named "OBSMoira"
    * a post by OBSWinston titled "Valiant vs. Shock"
    * a post by OBSWinston titled "Take 3 Please"
    * a post by OBSMoira titled "FIGHTING!"
    * a post by OBSMoira titled "OBS-ing!"

  # Scenario: User can add a derivative from their own post
    # Given I am logged in as OBSWinston
    # When I try to edit the post titled "Valiant vs. Shock"
    # And I try to add the post titled "Take 3 Please" as a source
    # Then I should see "Take 3 Please" as a source for "Valiant vs. Shock"
    # And I should see "Valiant vs. Shock" as a derivative of "Take 3 Please"
    # And the user named "OBSWinston" should not have any notifications

  # Scenario: User can add a derivative from another user's post
    # Given I am logged in as OBSWinston
    # When I try to edit the post titled "Valiant vs. Shock"
    # And I try to add the post titled "FIGHTING!" as a source
    # Then I should see "FIGHTING!" as a source for "Valiant vs. Shock"
    # And I should see "Valiant vs. Shock" as a derivative of "FIGHTING!"
    # And the user "OBSMoira" should have a new notification

  Scenario: User can remove a source
    Given I am logged in as OBSWinston
    And "Valiant vs. Shock" has a source "Take 3 Please"
    When I try to edit the post titled "Valiant vs. Shock"
    And I try to remove the post titled "Take 3 Please" as a source
    Then I should not see "Take 3 Please" as a source for "Valiant vs. Shock"
    And I should not see "Valiant vs. Shock" as a derivative of "Take 3 Please"

  # Scenario Outline: Non-public posts do not appear publicly via derivatives
    # Given I am logged in as OBSMoira
    # And the post titled "OBS-ing!" is <visibility>
    # When I try to edit the post titled "OBS-ing!"
    # And I add the post titled "Valiant vs. Shock" as a source
    # Then I should see "Valiant vs. Shock" as a source for "OBS-ing!"
    # But I should not see "OBS-ing!" as a derivative of "Valiant vs. Shock"

    # Examples:
      # | visibility |
      # | unlisted   |
      # | private    |
      # | a draft    |

  Scenario Outline: Non-public posts do not issue notifications
    Given I am logged in as OBSMoira
    And <visibility> post by OBSMoira titled "ReinReinRein"
    When I try to edit the post titled "ReinReinRein"
    And I add the post titled "Valiant vs. Shock" as a source
    Then I should see "Valiant vs. Shock" as a source for "ReinReinRein"
    And the user "OBSWinston" should not have any notifications

  Examples:
    | visibility    |
    | an unlisted   |
    | a private     |
    | a draft       |
