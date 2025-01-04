import Rails from "@rails/ujs"

export default class FetchRails {
  url: string
  body: string | object
  defaultParams: {
    headers: { [key: string]: string }
    credentials: RequestCredentials
  }

  constructor(url: string, body?: string | object, headers = {}) {
    this.url = url
    this.body = body || ""
    this.defaultParams = {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": Rails.csrfToken() || "",
        ...headers
      },
      credentials: "same-origin"
    }
  }

  async request(method = "get", { timeout = 10000, returnResponse = false, parameters = {} } = {}): Promise<string | Response> {
    const timeoutController = new AbortController()
    const timeoutID = setTimeout(() => timeoutController.abort(), timeout)

    if ("headers" in parameters && typeof parameters.headers === "object") {
      parameters["headers"] = { ...this.defaultParams.headers, ...parameters.headers }
    }

    const finalParams = {
      method: method,
      ...this.defaultParams,
      ...parameters,
      signal: timeoutController.signal
    }
    const response = await fetch(this.url, finalParams)
    clearTimeout(timeoutID)
    if (returnResponse) return await response
    if (!response.ok) throw new Error(`${response.status}: ${response.statusText}.`)

    const data = await response.text()
    return data.toString()
  }

  async get({timeout = 10000, returnResponse = false, parameters = {}} = {}): Promise<string | Response> {
    return this.request("get", { timeout, returnResponse, parameters })
  }

  async post({timeout = 10000, returnResponse = false, parameters = {}, method = "post"} = {}): Promise<string | Response> {
    parameters = {...parameters, body: JSON.stringify(this.body)}
    return this.request(method, { timeout, returnResponse, parameters })
  }
}
