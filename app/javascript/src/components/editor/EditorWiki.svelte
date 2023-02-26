<script>
  import FetchRails from "../../fetch-rails"
  import EditorWikiSearch from "./EditorWikiSearch.svelte"

  let article

  function click(event) {
    if (!event.target.href) return

    event.preventDefault()

    const currentHost = window.location.hostname
    if (event.target.href.includes(currentHost)) fetchArticle(event.target.href)
    else window.open(event.target.href, "_blank")
  }

  export function fetchArticle(baseUrl, single = false) {
    const progressBar = new Turbolinks.ProgressBar()
    progressBar.setValue(0)
    progressBar.show()

    new FetchRails(`${ baseUrl }.json?parse_markdown=true${ single ? "&single=true" : "" }`).get()
      .then(data => {
        if (!data) throw Error("Error while loading wiki article")

        article = JSON.parse(data)
      })
      .catch(error => {
        alert(error)
        console.error(error)
      })
      .finally(() => {
        progressBar.setValue(1)
        progressBar.hide()
      })
  }
</script>

<EditorWikiSearch on:select={event => article = event.detail.result} />

{#if article}
  <div class="mt-1/2" on:click={click}>
    <div class="text-dark mb-1/8">{article.category.title}</div>
    <h2 class="mt-0 mb-1/8">{article.title}</h2>
    {#if article.subtitle}
      <h5 class="mt-0">{article.subtitle}</h5>
    {/if}

    <div class="item__description">
      {@html article.content}
    </div>
  </div>
{/if}
