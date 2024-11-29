// @vitest-environment jsdom

import { bind, toggleFavorite } from "@src/favorite"
import { vi, describe, it, expect } from "vitest"
import { fireEvent } from "@testing-library/dom"
import "@src/remove-and-add-event-listener"

vi.mock("@rails/ujs", () => ({
  default: {
    csrfToken: () => vi.fn()
  }
}))

describe("favorite.ts", () => {
  describe("bind", () => {
    it("Should call toggleFavorite when correct element is clicked", async() => {
      const element = document.createElement("button")
      element.dataset.action = "favorite"
      const imageElement = document.createElement("img")
      element.insertAdjacentElement("afterbegin", imageElement)
      document.body.insertAdjacentElement("afterbegin", element)

      bind()

      const button = document.querySelector("button")
      fireEvent.click(button)

      expect(button.dataset.active).toBe("true")
    })

    it("Should not call toggleFavorite when body element is clicked", async() => {
      const element = document.createElement("button")
      element.dataset.action = "favorite"
      const imageElement = document.createElement("img")
      element.insertAdjacentElement("afterbegin", imageElement)
      document.body.insertAdjacentElement("afterbegin", element)

      bind()

      fireEvent.click(document.body)

      const button = document.querySelector("button")
      expect(button.dataset.active).not.toBe("true")
    })

    it("Should call toggleFavorite only on related element", async() => {
      const element = document.createElement("button")
      element.dataset.action = "favorite"
      const imageElement = document.createElement("img")
      element.insertAdjacentElement("afterbegin", imageElement)
      const element2 = document.createElement("button")
      element2.dataset.action = "favorite"
      element2.insertAdjacentElement("afterbegin", imageElement)
      document.body.insertAdjacentElement("afterbegin", element)
      document.body.insertAdjacentElement("afterbegin", element2)

      bind()

      const [button1, button2] = document.querySelectorAll("button")
      fireEvent.click(button1)

      expect(button1.dataset.active).toBe("true")
      expect(button2.dataset.active).not.toBe("true")
    })
  })

  describe("toggleFavorite", () => {
    it("Should set active state when not active", () => {
      const element = document.createElement("div")
      const imageElement = document.createElement("img")
      element.insertAdjacentElement("afterbegin", imageElement)

      toggleFavorite(element)

      expect(element.classList).toContain("favorite--is-active")
      expect(element.dataset.active).toBe("true")
    })

    it("Should set inactive state when active", () => {
      const element = document.createElement("div")
      const imageElement = document.createElement("img")
      imageElement.src = "some-src"
      element.insertAdjacentElement("afterbegin", imageElement)
      element.dataset.active = "true"

      toggleFavorite(element)

      expect(element.classList).not.toContain("favorite--is-active")
      expect(element.dataset.active).toBe("false")
    })
  })
})
