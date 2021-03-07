class BlocksController < ApplicationController
  before_action only: [:create, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def create
    @user = current_user
    @block = Block.new(block_params)
    @block.user_id = @user.id

    if @block.content_type == "profile"
      create_profile_block
    elsif @block.content_type == "post"
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

  def show_or_create
    if params[:id].present?
      @block = current_user.blocks.find(id: params[:id], content_type: :post)
    else
      @block = Block.create(user_id: current_user.id, content_type: :post, name: params[:name])
    end

    if @block.present?
      render "blocks/post/_block_settings", layout: false
    else
      render json: "error"
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
