import { toggleFavorite } from "../../app/javascript/src/favorite"

jest.mock("@rails/ujs", () => ({
  csrfToken: () => jest.fn()
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
