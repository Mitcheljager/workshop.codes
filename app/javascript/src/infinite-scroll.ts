import Rails from "@rails/ujs"
import * as timeago from "@src/timeago.js"
import isCrawler from "@utils/is-crawler.js"

export function bind(): void {
  const element = document.querySelector("[data-role='infinite-scroll-marker']")
  const button = document.querySelector("[data-role='load-more-posts']")

  window.removeEventListener("scroll", isInfiniteScrollInView)
  if (element) {
    window.addEventListener("scroll", isInfiniteScrollInView)
    hideBackupPagination()
  }

  if (!button) return
  button.removeAndAddEventListener("click", loadMorePosts)
}

function isInfiniteScrollInView(): void {
  const elements = document.querySelectorAll("[data-role='infinite-scroll-marker']")
  const element = elements[elements.length - 1] as HTMLElement

  if (!element) return
  if (element.offsetParent === null) return

  const position = element.getBoundingClientRect()

  if (element.dataset.reached == "true") return

  if(position.top < window.innerHeight + 500 && position.bottom >= 0) {
    getInfiniteScrollContent(element)
    element.setAttribute("data-reached", "true")
  }
}

function loadMorePosts({ target }: { target: HTMLElement }): void {
  getInfiniteScrollContent(target)
}

function getInfiniteScrollContent(element: HTMLElement): void {
  if (!element.dataset.url) return

  element.innerHTML = "<div class='spinner'></div>"

  // Get last requested post set URL
  const requestUrl = new URL(element.dataset.url)

  // Increment page parameter
  if (requestUrl.searchParams.get("page") != null) {
    requestUrl.searchParams.set("page", (Number(requestUrl.searchParams.get("page")) + 1).toString())
  } else {
    requestUrl.searchParams.set("page", "2")
  }

  // Ensure request is interpreted as requesting JavaScript response
  if (!requestUrl.pathname.endsWith(".js")) requestUrl.pathname += ".js"
  const requestUrlString = requestUrl.toString()

  const container = document.querySelector(".items") || document.querySelector(".cards")
  const spinner = container?.querySelector(".spinner")

  container!.ariaBusy = "true"

  Rails.ajax({
    type: "get",
    url: requestUrlString,
    success: () => {
      if (spinner) spinner.remove()
      if (element.dataset.loadMethod === "load-more-button") {
        element.innerHTML = "Load more"
        element.setAttribute("data-url", requestUrlString)
      }

      timeago.initialize()
    },
    error: () => {
      if (spinner) spinner.remove()
      if (element.dataset.loadMethod === "load-more-button") {
        element.innerHTML = "An error occurred. Try again?"
      } else if (element.dataset.loadMethod === "infinite-scroll") {
        let button = document.querySelector("[data-role='load-more-posts']")
        if (!button) {
          element.insertAdjacentHTML("afterend", `
            <div class="flex justify-center">
              <div
                class="mt-1/2 button button--secondary pr-1/1 pl-1/1"
                data-role="load-more-posts"
                data-load-method="load-more-button"
                data-url="${requestUrl}">

                An error occurred. Try again?
              </div>
            </div>
          `)
        }

        button = document.querySelector<HTMLElement>("[data-role='load-more-posts']")
        button?.removeAndAddEventListener("click", loadMorePosts)
      }
    },
    complete: () => {
      container!.ariaBusy = null
    }
  })
}

function hideBackupPagination(): void {
  if (isCrawler()) return

  const element = document.querySelector("[data-role='infinite-scroll-backup-pagination']")
  if (!element) return
  element.remove()
}
