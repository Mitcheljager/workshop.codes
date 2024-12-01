<script>
  import { heroes } from "@stores/editor"
  import { createEventDispatcher } from "svelte"

  export let key

  const dispatch = createEventDispatcher()
  const groups = groupHeroesByCategory($heroes)

  let selected = []

  function groupHeroesByCategory(heroes) {
    const categories = ["Tank", "Damage", "Support"]

    return categories.map(category => ({
      category,
      heroes: heroes
        .filter(hero => hero.category === category)
        .map(hero => hero.name)
    }))
  }

  function change() {
    const value = selected.length ? selected : null

    dispatch("change", value)
  }
</script>

<h3>{key}</h3>

<div class="form-group-triple">
  {#each groups as { category, heroes }}
    <div>
      <strong>{category}</strong>
      {#each heroes as hero}
        <div class="checkbox">
          <input type="checkbox" id={key + hero} value={hero} bind:group={selected} on:change={change} />
          <label for={key + hero}>{hero}</label>
        </div>
      {/each}
    </div>
  {/each}
</div>
