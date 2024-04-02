// @vitest-environment jsdom

import { toggleFavorite } from "../src/favorite"
import { vi, describe, it, expect } from "vitest"

vi.mock("@rails/ujs", () => ({
  default: {
    csrfToken: () => vi.fn()
  }
}))

describe("favorite.js", () => {
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
      element.insertAdjacentElement("afterbegin", imageElement)
      element.dataset.active = "true"

      toggleFavorite(element)

      expect(element.classList).not.toContain("favorite--is-active")
      expect(element.dataset.active).toBe("false")
    })
  })
})
