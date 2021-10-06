Feature: Content reports

    As an administrator on Workshop.codes
    So that I can moderate the content of the site
    I should be able to view and action reports of user-generated content

  Background: Some posts and some reports
    Given a user named "GwishinOmnic"
    And an admin named "Athena"
    Then a post by GwishinOmnic titled "Attack on Busan"
    And a report for the post "Attack on Busan"

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
