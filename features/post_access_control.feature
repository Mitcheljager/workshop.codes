Feature: Users cannot manage other user's posts
  As a user of Workshop.codes
  So that other users can trust post content
  I should not be able to manage other user's posts

  Background: Two users and a post
    Given a normal user named "Winston"
    And a normal user named "Sombra"
    And a post by Winston titled "Athena's Training Program"

  Scenario: Sombra tries to edit someone else's post
    Given I am logged in as Sombra
    When I try to edit the post titled "Athena's Training Program"
    Then I should see "You are not authorized to perform that action"
    And I should be on the page for the post titled "Athena's Training Program"
