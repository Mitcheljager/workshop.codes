document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role~='block-sortable']")

  if (element) buildBlockSortable(element)
})

function buildBlockSortable(element) {
  const sortable = Sortable.create(element, {
    draggable: ".content-block",
    animation: 50,
    onUpdate: () => { updateBlockSortable() }
  })
}

function updateBlockSortable() {
  const blocks = document.querySelectorAll(".content-block")

  const positions = []
  blocks.forEach((block, i) => positions.push({ id: [block.dataset.id], position: i }))

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  fetch("/blocks/set_positions", {
    method: "post",
    body: JSON.stringify({ blocks: positions }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .finally(() => {
    progressBar.setValue(1)
    progressBar.hide()
  })
}
