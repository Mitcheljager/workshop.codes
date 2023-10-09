import replaceAllInserter from "string.prototype.replaceall"
import { JSDOM } from "jsdom"

replaceAllInserter.shim()

const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window
