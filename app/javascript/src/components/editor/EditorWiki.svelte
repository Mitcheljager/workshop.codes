<script>
  import EditorWikiSearch from "./EditorWikiSearch.svelte"

  let article
</script>

<EditorWikiSearch on:select={event => article = event.detail.result} />

{#if article}
  <div class="mt-1/2">
    <div class="text-dark mb-1/8">{article.category.title}</div>
    <h2 class="mt-0 mb-1/8">{article.title}</h2>
    <h5 class="mt-0">{article.subtitle}</h5>

    <div class="item__description">
      {@html article.content}
    </div>
  </div>
{/if}
