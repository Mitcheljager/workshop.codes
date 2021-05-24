export function send() {
  if (typeof ga === "function") {
    gtag("config", "UA-46852314-10", {
      "anonymize_ip": true,
      "page_location": event.data.url
    })
  }
}
