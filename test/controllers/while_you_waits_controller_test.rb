require 'test_helper'

class WhileYouWaitsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get while_you_waits_index_url
    assert_response :success
  end

end
