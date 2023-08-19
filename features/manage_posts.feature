Feature: Users can manage their own posts
  As a user with an account
  So that I can share my Workshop creations with the world
  I want to be able to make and manage my posts on Workshop.codes

  Background: Logged-in user with a post
    Given a normal user named "LOxton"
    And a post by LOxton titled "Lena's Cool Mode"
    And I am logged in as LOxton

  @javascript
  Scenario: User creates a post
    When I try to create a post titled "Lena's Second Cool Mode"
    #FIXME: Then I should see a notification saying "Post successfully created"
    And I should be on the page for the post titled "Lena's Second Cool Mode"

  Scenario: User can edit their own post
    When I try to edit the post titled "Lena's Cool Mode"
    Then I should be able to edit the post's title to "Lena's AWESOME Mode"
    #FIXME: And I should see a notification saying "Post successfully edited"
    And I should be on the page for the post titled "Lena's AWESOME Mode"

  @javascript
  Scenario: User can delete their own post
    When I try to delete the post titled "Lena's Cool Mode"
    #FIXME: Then I should see a notification saying "Post successfully deleted"
    And there should not be a post titled "Lena's Cool Mode"
