<script>
  import FetchRails from "../../fetch-rails"
  import EditorWikiSearch from "./EditorWikiSearch.svelte"
  import ExternalLinkIcon from "../icon/ExternalLink.svelte"

  let article
  let contentElement

  function click(event) {
    if (!event.target.href) return

    event.preventDefault()

    const href = new URL(event.target.href)

    const currentHost = window.location.hostname
    if (href.hostname != currentHost) {
      window.open(event.target.href, "_blank")
      return
    }

    if (!!href.hash) jumpToSection(href.hash.substring(1))
    else if (href.pathname.startsWith("/wiki")) fetchArticle(event.target.href)
  }

  function jumpToSection(slug) {
    contentElement.querySelector(`#${ slug }`)?.scrollIntoView()
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
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="mt-1/2" on:click={click}>
    <div class="text-dark mb-1/8">{article.category.title}</div>
    <h2 class="mt-0 mb-1/8">
      {article.title} <a href={`/wiki/articles/${ article.slug }`} target="_blank"><ExternalLinkIcon /></a>
    </h2>
    {#if article.subtitle}
      <h5 class="mt-0">{article.subtitle}</h5>
    {/if}

    <div class="item__description" bind:this={contentElement}>
      {@html article.content}
    </div>
  </div>
{:else}
  <em class="block text-dark text-small mt-1/8">Tip: Alt + click a keyword to instantly search.</em>
{/if}
