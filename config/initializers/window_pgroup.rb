if Gem.win_platform?
  module Process
    class << self
      alias_method :_pre_pgroup_patch_spawn, :spawn

      def spawn(*arguments)
        if arguments.last.is_a?(Hash) && arguments.last.key?(:pgroup)
          arguments = arguments.dup
          options = arguments.pop.dup
          options.delete(:pgroup)
          arguments << options unless options.empty?
        end

        _pre_pgroup_patch_spawn(*arguments)
      end
    end
  end
end
