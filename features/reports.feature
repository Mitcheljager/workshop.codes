Feature: Content reports

    As an administrator on Workshop.codes
    So that I can moderate the content of the site
    I should be able to view and action reports of user-generated content

  Background: Some posts and some reports
    Given a user named "GwishinOmnic"
    * a user named "HanaSong"
    * an admin named "Athena"
    And a post by GwishinOmnic titled "Attack on Busan"
    And a report for the post "Attack on Busan"

  @javascript
  Scenario: User can report post
    Given I am logged in as HanaSong
    And I try to report the post titled "Attack on Busan"
    Then I should see "Your report has been submitted"

  @javascript
  @wip
  Scenario: User can report comment
    # TODO: Add a comment (either in Background or in a Given)
    # TODO: Verify that a user can report a comment

  Scenario: Admin can accept reports
    Given I am logged in as Athena
    And I open the latest report about the post "Attack on Busan"
    Then I should be able to accept the report
    And I should be on the page for the report
    And I should see "accepted"

  Scenario: Admin can reject reports
    Given I am logged in as Athena
    And I open the latest report about the post "Attack on Busan"
    Then I should be able to reject the report
    And I should be on the reports queue page
    And I should see "rejected"
