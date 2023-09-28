# This is a reimplementation of https://github.com/will-wow/webpacker-svelte so we can use do blocks as loading state

module SvelteHelper
  def svelte_component(name, props = {}, options = {}, &block)
    tag = options.delete(:tag) || :div
    data = { data: { "svelte-component": name, "svelte-props": props.to_json } }
    content = capture(&block) if block_given?

    content_tag(tag, content, options.deep_merge(data))
  end
end
