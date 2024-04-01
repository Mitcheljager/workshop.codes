import { createNewItem, destroyItem, duplicateItem, getItemById, getSaveContent, isAnyParentHidden, setCurrentItemById, toggleFolderState, toggleHideItem, updateItem, updateItemName, updateStateForId } from "../../src/utils/editor"
import { currentItem, items, editorStates, openFolders } from "../../src/stores/editor"
import { defaultLanguage, selectedLanguages, translationKeys } from "../../src/stores/translationKeys"
import { get } from "svelte/store"
import { vi, describe, it, expect, afterEach, beforeEach } from "vitest"

const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key],
    setItem: (key, value) => store[key] = value.toString(),
    clear: () => store = {}
  }
})()

Object.defineProperty(global, "localStorage", { value: localStorageMock })

describe("editor.js", () => {
  afterEach(() => {
    items.set([])
  })

  describe("createNewItem", () => {
    it("Should create a new item with default values", () => {
      const newItem = createNewItem("Item 1", "Test")

      expect(newItem.name).toBe("Item 1")
      expect(newItem.type).toBe("item")
      expect(newItem.position).toBe(9999)
      expect(newItem.content).toBe("Test")
    })

    it("should create a new item with custom values", () => {
      const newItem = createNewItem("Item 2", "Custom content", 123, "folder")

      expect(newItem.name).toBe("Item 2")
      expect(newItem.type).toBe("folder")
      expect(newItem.position).toBe(123)
      expect(newItem.content).toBe("Custom content")
    })
  })

  describe("destroyItem", () => {
    beforeEach(() => {
      items.set([
        { id: 1, parent: null },
        { id: 2, parent: 1 },
        { id: 3, parent: 1 }
      ])
    })

    it("Should destroy item with the given id and its children", () => {
      destroyItem(1)

      expect(get(items)).toEqual([])
    })

    it("Should only destroy item with the given id and not its children", () => {
      destroyItem(2)

      expect(get(items)).toEqual([
        { id: 1, parent: null },
        { id: 3, parent: 1 }
      ])
    })

    it("Should not modify the items array if the given id does not exist", () => {
      destroyItem(4)

      expect(get(items)).toEqual([
        { id: 1, parent: null },
        { id: 2, parent: 1 },
        { id: 3, parent: 1 }
      ])
    })

    it("Should unset currentItem if currentItem is the removed item or parent", () => {
      currentItem.set({ id: 2 })
      destroyItem(2)
      expect(get(currentItem)).toEqual({})

      currentItem.set({ parent: 1 })
      destroyItem(1)
      expect(get(currentItem)).toEqual({})
    })
  })

  describe("destroyItem", () => {
    it("Should update name for item with given id", () => {
      items.set([{ id: 1, name: "test" }])
      updateItemName(1, "test 2")
      expect(get(items)[0].name).toBe("test 2")
    })
  })

  describe("toggleHideItem", () => {
    it("Should toggle hidden status for item with given id", () => {
      items.set([{ id: 1, hidden: false }])

      toggleHideItem(1)
      expect(get(items)[0].hidden).toBe(true)

      toggleHideItem(1)
      expect(get(items)[0].hidden).toBe(false)
    })
  })

  describe("toggleHideItem", () => {
    beforeEach(() => {
      items.set([
        { id: 1, parent: null, hidden: false },
        { id: 2, parent: 1, hidden: false },
        { id: 3, parent: 2, hidden: false }
      ])
    })

    it("Should return true if any parent item is hidden", () => {
      get(items)[1].hidden = true

      const result = isAnyParentHidden(get(items)[2])
      expect(result).toBe(true)
    })

    it("should return false if no parent item is hidden", () => {
      const result = isAnyParentHidden(get(items)[2])

      expect(result).toBe(false)
    })

    it("should return false if the item has no parent", () => {
      const result = isAnyParentHidden(get(items)[1])
      expect(result).toBe(false)
    })
  })

  describe("duplicateItem", () => {
    beforeEach(() => {
      items.set([
        { id: 1, name: "Item 1", parent: null, hidden: false, content: "Content 1", position: 1, type: "folder" },
        { id: 2, name: "Item 2", parent: 1, hidden: false, content: "Content 2", position: 2, type: "item" },
        { id: 3, name: "Item 3", parent: 2, hidden: false, content: "Content 3", position: 3, type: "item" }
      ])
    })

    it("Should duplicate the item with (Copy) added to the name", () => {
      const itemToDuplicate = get(items)[2]

      duplicateItem(itemToDuplicate)

      expect(get(items).length).toBe(4)
      expect(get(items)[3].name).toBe("Item 3 (Copy)")
      expect(get(items)[3].parent).toBe(itemToDuplicate.parent)
      expect(get(items)[3].hidden).toBe(itemToDuplicate.hidden)
      expect(get(items)[3].content).toBe(itemToDuplicate.content)
      expect(get(items)[3].position).toBe(itemToDuplicate.position)
      expect(get(items)[3].type).toBe(itemToDuplicate.type)
    })

    it("Should duplicate the item with new parent if provided", () => {
      const itemToDuplicate = get(items)[2]
      const newParent = 1

      duplicateItem(itemToDuplicate, newParent)

      expect(get(items).length).toBe(4)
      expect(get(items)[3].parent).toBe(1)
    })

    it("Should duplicate a folder item and its children", () => {
      const itemToDuplicate = get(items)[0]
      const newParent = null

      duplicateItem(itemToDuplicate, newParent)

      expect(get(items).length).toBe(5)
      expect(get(items)[3].name).toBe("Item 1 (Copy)")
      expect(get(items)[3].parent).toBe(newParent)
      expect(get(items)[4].name).toBe("Item 2")
      expect(get(items)[4].parent).toBe(get(items)[3].id)
    })
  })

  describe("getItemById", () => {
    beforeEach(() => {
      items.set([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" }
      ])
    })

    it("Should return the item with the given id", () => {
      const result = getItemById(2)
      expect(result).toEqual({ id: 2, name: "Item 2" })
    })

    it("Should return null if no item is found with the given id", () => {
      const id = 4
      const result = getItemById(id)
      expect(result).toBeNull()
    })
  })

  describe("setCurrentItemById", () => {
    beforeEach(() => {
      items.set([{ id: 1 }, { id: 2 }])
      currentItem.set({ id: 1 })
    })

    it("Should set the current item to the item with the given id", () => {
      setCurrentItemById(2)
      expect(get(currentItem)).toEqual({ id: 2 })
    })

    it("Should not set the current item if no item is found with the given id", () => {
      setCurrentItemById(3)
      expect(get(currentItem)).toEqual({ id: 1 })
    })
  })

  describe("updateItem", () => {
    it("Should update item for given id", () => {
      items.set([{ id: 1, content: "Some content" }, { id: 2, content: "Other content" }])
      updateItem({ id: 1, content: "New content" })
      expect(get(items)).toEqual([{ id: 1, content: "New content" }, { id: 2, content: "Other content" }])
    })
  })

  describe("updateStateForId", () => {
    let stateUpdateMock

    beforeEach(() => {
      stateUpdateMock = vi.fn()

      editorStates.set({
        "1": { id: 1, doc: "Document 1", update: stateUpdateMock },
        "2": { id: 2, doc: "Document 2", update: stateUpdateMock }
      })

      currentItem.set({ id: 1 })
    })

    it("Should update the state for the given id with the given insert", () => {
      const id = 1
      const insert = " Updated text"
      const mockState = { id: 1, doc: "Document 1" }
      const mockTransaction = { state: { id: 1, doc: "Document 1 Updated text" } }
      stateUpdateMock.mockReturnValue(mockTransaction)

      updateStateForId(id, insert)

      expect(stateUpdateMock).toHaveBeenCalledWith({ changes: { from: 0, to: mockState.doc.length, insert } })
      expect(get(editorStates)[id]).toEqual(mockTransaction.state)
    })
  })

  describe("toggleFolderState", () => {
    let item

    beforeEach(() => {
      items.set([{ id: 1, type: "folder" }, { id: 2, type: "folder", parent: 1 }])
      item = get(items)[0]
      openFolders.set([])
      global.localStorage.clear()
    })

    it("Should set the state of the folder item in localStorage if set is true", () => {
      const state = true
      const set = true

      toggleFolderState(item, state, set)
      expect(localStorageMock.getItem(`folder_expanded_${ item.id }`)).toBe("true")
    })

    it("Should not set the state of the folder item in localStorage if set is false", () => {
      const state = true
      const set = false

      toggleFolderState(item, state, set)
      expect(localStorageMock.getItem(`folder_expanded_${ item.id }`)).toBeUndefined()
    })

    it("Should add the folder item id to openFolders if the state is true", () => {
      const state = true

      toggleFolderState(item, state)
      expect(get(openFolders)).toEqual([1])
    })

    it("Should remove the folder item id from openFolders if the state is false", () => {
      const state = false

      toggleFolderState(item, state)
      expect(get(openFolders)).toEqual([])
    })

    it("Should recursively call toggleFolderState on the parent folder item if it exists", () => {
      item = get(items)[1]

      const state = true

      toggleFolderState(item, state)
      expect(get(openFolders)).toEqual([2, 1])
    })
  })

  describe("getSaveContent", () => {
    it("Should return various stores in a single formatted string", () => {
      items.set({})
      translationKeys.set({})
      selectedLanguages.set({})
      defaultLanguage.set("test")

      const result = getSaveContent()

      expect(result).toBe("{\"items\":{},\"translations\":{\"keys\":{},\"selectedLanguages\":{},\"defaultLanguage\":\"test\"}}")
    })
  })
})
