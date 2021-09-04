Feature: User-made posts
  As a user with an account
  So that I can share my Workshop creations with the world
  I want to be able to make posts on Workshop.codes

  Background: Logged-in user
    Given a normal user named "LOxton"
    And a post titled "Lena's Cool Mode"
    And another normal user named "ALacroix"

  Rule: Users can manage their own posts
    Scenario: User creates a post
      Given I am logged in as LOxton
      When I create a post titled "Lena's Second Cool Mode"
      Then I should see "Post successfully created"
      And I should be on the page for the post titled "Lena's Second Cool Mode"

    Scenario: User can edit their own post
      Given I am logged in

  Rule: Users cannot 
