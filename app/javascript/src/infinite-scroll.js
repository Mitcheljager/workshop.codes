import Rails from "@rails/ujs"

export function bind() {
  const element = document.querySelector("[data-role='infinite-scroll-marker']")
  const button = document.querySelector("[data-role='load-more-posts']")

  window.removeEventListener("scroll", isInfiniteScrollInView)
  if (element) window.addEventListener("scroll", isInfiniteScrollInView)

  if (!button) return
  button.removeAndAddEventListener("click", loadMorePosts)
}

function isInfiniteScrollInView() {
  const elements = document.querySelectorAll("[data-role='infinite-scroll-marker']")
  const element = elements[elements.length - 1]

  if (!element) return

  const position = element.getBoundingClientRect()

  if (element.dataset.reached == "true") return

  if(position.top < window.innerHeight && position.bottom >= 0) {
    getInfiniteScrollContent(element)
    element.setAttribute("data-reached", true)
  }
}

function loadMorePosts() {
  getInfiniteScrollContent(event.target)
}

function getInfiniteScrollContent(element) {
  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  element.innerHTML = "<div class='spinner'></div>"

  const currentUrl = element.dataset.url.replace(".js", "")
  const splitUrl = currentUrl.split("page/")
  let nextUrl = ""

  if (splitUrl.length > 1) {
    const prefix = splitUrl[0]
    const pageNumber = splitUrl[1]
    nextUrl = prefix + "page/" + (parseInt(pageNumber) + 1)
  } else {
    nextUrl = currentUrl + "/page/2"
  }

  Rails.ajax({
    type: "get",
    url: nextUrl + ".js",
    success: (response) => {
      progressBar.setValue(1)
      progressBar.hide()

      const spinner = document.querySelector(".items").querySelector(".spinner")
      if (spinner) spinner.remove()
      if (element.classList.contains("button")) {
        element.innerHTML = "Load more"
        element.setAttribute("data-url", nextUrl)
      }
    }
  })
}
