class BlocksController < ApplicationController
  before_action only: [:create, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def create
    @block = Block.new(name: block_params[:name], user_id: current_user.id, content_type: block_params[:content_type])
    @user = current_user

    if block_params[:content_type] == "profile"
      create_profile_block
    elsif params[:content_type] == "post"
      create_post_block
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

  def set_positions
    params[:blocks].each do |block|
      @block = current_user.blocks.where(id: block[:id]).first

      @block.update_attribute(:position, block[:position])
    end
  end

  private

  def block_params
    params.require(:block).permit(:name, :content_type)
  end

  def create_profile_block
    respond_to do |format|
      format.js {
        if @user.blocks.where(content_type: :profile).size >= 3
          @message = "You have already added 3 blocks."
          render "application/error"
        else
          unless @block.save
            render "application/error"
          end
        end
      }
    end
  end

  def create_post_block
    respond_to do |format|
      format.js {
        unless @block.save
          render "application/error"
        end
      }
    end
  end
end
