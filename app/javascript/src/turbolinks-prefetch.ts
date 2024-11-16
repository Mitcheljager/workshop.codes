// Adjusted from https://github.com/huacnlee/turbolinks-prefetch
// The original NPM package is modified to include links around images
// and to automatically exclude links with the data-actions attribute

export default class {
  static start(delay?: number) {
    if (!window.Turbolinks) {
      console.error("window.Turbolinks not found, you must import Turbolinks with global.")
      return
    }

    // @ts-ignore
    const prefetcher = new Prefetcher(window.Turbolinks.controller)
    prefetcher.start(delay)
  }
}

class Prefetcher {
  delay?: number
  fetchers: any
  doc: Document
  xhr: XMLHttpRequest
  controller: any

  constructor(controller: any) {
    this.delay = 100
    this.fetchers = {}
    this.doc = document.implementation.createHTMLDocument("prefetch")
    this.xhr = new XMLHttpRequest()
    this.controller = controller
    this.controller.getActionForLink = (link: HTMLElement) => {
      return this.getActionForLink(link)
    }
  }

  start(delay = 100) {
    this.delay = delay || this.delay
    document.addEventListener("mouseover", (event) => {
      this.mouseover(event)
    })
  }

  mouseover(event: MouseEvent) {
    let target = event.target as HTMLElement | null
    if (target instanceof HTMLImageElement) target = target.closest("a")

    if (!target) return

    if (target.hasAttribute("data-action")) return
    if (target.hasAttribute("data-remote")) return
    if (target.hasAttribute("data-method")) return
    if (target.getAttribute("data-prefetch") === "false") return
    if (target.closest("[data-prefetch='false']")) return
    if (target.getAttribute("target") === "_blank") return
    const href = target.getAttribute("href") || target.getAttribute("data-prefetch")

    // skip no fetch link
    if (!href) return
    // skip anchor
    if (href.startsWith("#")) return
    // skip mailto
    if (href.startsWith("mailto:")) return
    // skip tel
    if (href.startsWith("tel:")) return
    // skip outside link
    if (href.includes("://") && !href.startsWith(window.location.origin)) return
    if (this.prefetched(href)) return
    if (this.prefetching(href)) return

    this.cleanup(event, href)

    if (!event.target) return

    event.target.addEventListener("mouseleave", ((event: MouseEvent) => this.mouseleave(event, href)) as EventListener)
    event.target.addEventListener("mousedown", ((event: MouseEvent) => this.mouseleave(event, href)) as EventListener)

    this.fetchers[href] = setTimeout(() => this.prefetch(href), this.delay)
  }

  mouseleave(event: MouseEvent, href: string) {
    this.xhr.abort()
    this.cleanup(event, href)
  }

  cleanup(event: MouseEvent, href: string) {
    const element = event.target as HTMLElement
    clearTimeout(this.fetchers[href])
    this.fetchers[href] = null

    element.removeEventListener("mouseleave", (event) => {
      return this.mouseleave(event, href)
    })
  }

  fetchPage(url: string, success: Function) {
    const { xhr } = this
    xhr.open("GET", url)
    xhr.setRequestHeader("Purpose", "prefetch")
    xhr.setRequestHeader("Accept", "text/html")
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return
      if (xhr.status !== 200) return
      success(xhr.responseText)
    }
    xhr.send()
  }

  prefetchTurbolink(url: string) {
    const { doc } = this
    this.fetchPage(url, (responseText: string) => {
      doc.open()
      doc.write(responseText)
      doc.close()
      this.fetchers[url] = null

      // @ts-ignore
      const snapshot = window.Turbolinks.Snapshot.fromHTMLElement(doc.documentElement)

      snapshot.isFresh = true
      this.controller.cache.put(url, snapshot)
    })
  }

  prefetch(url: string) {
    if (this.prefetched(url)) return
    this.prefetchTurbolink(url)
  }

  prefetched(url: string) {
    const hasSnapshot = location.href === url || this.controller.cache.has(url)
    const snapshot = this.controller.cache.get(url)
    return hasSnapshot && snapshot?.isFresh
  }

  prefetching(url: string) {
    return !!this.fetchers[url]
  }

  isAction(action: string) {
    return action == "advance" || action == "replace" || action == "restore"
  }

  getActionForLink(link: HTMLElement) {
    const { controller } = this
    const location = controller.getVisitableLocationForLink(link)
    const snapshot = controller.cache.get(location)

    if (snapshot?.isFresh) {
      snapshot.isFresh = false
      controller.cache.put(link, snapshot)
      return "restore"
    }

    const action = link.dataset.turbolinksAction || ""
    return this.isAction(action) ? action : "advance"
  }
}

