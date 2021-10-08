Feature: Wiki articles

  As a user of Workshop.codes
  So that I can exchange knowledge about the Workshop with other people
  I want to be able to create, organize, and read wiki articles about the Workshop

  Background: Some articles and categories
    Given a user named "Brigitte"
    And an admin named "Torbjorn"
    And the following categories exist:
      | title      | description                                              |
      | :--------- | :------------------------------------------------------- |
      | Tools      | Available tools in the hangar workshop.                  |
      | Blueprints | Design specifications for various commonly used devices. |
    And the following articles exist:
      | title          |  category  | content                                                                   |
      | :------------- | :--------: | :------------------------------------------------------------------------ |
      | Forge Hammer   |   Tools    | Belongs to Torbjorn Lindholm. Ask before borrowing.                       |
      | Ratchet Wrench |   Tools    | General purpose ratchet wrench. May be used by everyone.                  |
      | Repulsor Jack  |   Tools    | Hard light powered jack. Requires occassional power supply change.        |
      | Servo          | Blueprints | Power armor hydraulic actuator. Frequently gets sticky. Needs refinement. |
      | Comms Unit     | Blueprints | Overwatch standard comms device. Powered by Lumerico batteries.           |

  Scenario: Any user can create a new Wiki article
    Given I am logged in as Brigitte
    And I try to create a new wiki article:
      | title                | category | content                                                              |
      | :------------------- | :------: | :------------------------------------------------------------------- |
      | Hard-Light Blowtorch |  Tools   | Specialized Vishkar technology capable of welding every known metal. |
    Then I should be viewing the wiki article titled "Hard-Light Blowtorch"
    And I should see "Article successfully created"
    And I should see "Specialized Vishkar technology"

  # TODO: Add more Wiki scenarios
