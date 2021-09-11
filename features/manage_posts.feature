# @javascript
Feature: Users can manage their own posts
  As a user with an account
  So that I can share my Workshop creations with the world
  I want to be able to make and manage my posts on Workshop.codes

  Background: Logged-in user with a post
    Given a normal user named "LOxton"
    And a post by LOxton titled "Lena's Cool Mode"

  Scenario: User creates a post
    Given I am logged in as LOxton
    When I create a post titled "Lena's Second Cool Mode"
    Then I should see "Post successfully created"
    And I should be on the page for the post titled "Lena's Second Cool Mode"

  Scenario: User can edit their own post
    Given I am logged in as LOxton
    When I try to edit the post titled "Lena's Cool Mode"
    Then I should be able to edit the post's title to "Lena's AWESOME Mode"
    And I should see "Post successfully edited"
    And I should be on the page for the post titled "Lena's AWESOME Mode"

  Scenario: User can delete their own post
    Given I am logged in as LOxton
    When I try to delete the post titled "Lena's Cool Mode"
    Then I should see "Post successfully deleted"
    And there should not be a post titled "Lena's Cool Mode"
