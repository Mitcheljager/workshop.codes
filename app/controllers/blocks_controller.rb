class BlocksController < ApplicationController
  before_action only: [:create, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def create
    @block = Block.new(name: block_params[:name], user_id: current_user.id, content_type: :profile)
    @user = current_user


    respond_to do |format|
      if @user.blocks.where(content_type: :profile).size >= 3
        @message = "You have already added 3 blocks."
        format.js { render "application/error" }
      else
        if @block.save
          format.js
        else
          format.js { render "application/error" }
        end
      end
    end
  end

  def update
    @block = current_user.blocks.find(params[:id])

    respond_to do |format|
      format.js {
        if @block.update_attribute(:properties, params[:block][:properties])
          render "application/success"
        else
          render "application/error"
        end
      }
    end
  end

  def destroy
    @block = current_user.blocks.find(params[:id])

    respond_to do |format|
      if @block.destroy
        format.js
      else
        render "application/error"
      end
    end
  end

  private

  def block_params
    params.require(:block).permit(:name)
  end
end
