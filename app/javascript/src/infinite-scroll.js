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
  if (element.offsetParent === null) return

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

  // Get last requested post set URL
  const requestUrl = new URL(element.dataset.url)

  // Increment page parameter
  if (requestUrl.searchParams.get("page") != null) {
    requestUrl.searchParams.set("page", Number(requestUrl.searchParams.get("page")) + 1)
  } else {
    requestUrl.searchParams.set("page", 2)
  }

  // Ensure request is interpreted as requesting JavaScript response
  if (!requestUrl.pathname.endsWith(".js")) requestUrl.pathname += ".js"
  const requestUrlString = requestUrl.toString()

  Rails.ajax({
    type: "get",
    url: requestUrlString,
    success: (response) => {
      progressBar.setValue(1)
      progressBar.hide()

      const spinner = document.querySelector(".items").querySelector(".spinner")
      if (spinner) spinner.remove()
      if (element.dataset.loadMethod === "load-more-button") {
        element.innerHTML = "Load more"
        element.setAttribute("data-url", requestUrlString)
      }
    },
    error: (error) => {
      progressBar.setValue(1)
      progressBar.hide()

      const spinner = document.querySelector(".items")?.querySelector(".spinner")
      if (spinner) spinner.remove()
      if (element.dataset.loadMethod === "load-more-button") {
        element.innerHTML = "An error occurred. Try again?"
      } else if (element.dataset.loadMethod === "infinite-scroll") {
        const button = document.querySelector("[data-role='load-more-posts']")
        button.innerHTML = "An error occurred. Try again?"
        if (button) button.removeAndAddEventListener("click", loadMorePosts)
      }

    }
  })
}
