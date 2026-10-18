const previouslyTrackedEvents: string[] = []
const url = document.body.dataset.athenaUrl || ""

export default class Athena {
  async track(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      if (!url) throw new Error("No Athena url was found")
      if (this.isPreviouslyTracked(eventName, properties)) return

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event_name: eventName,
          properties
        })
      })

      this.addPreviouslyTracked(eventName, properties)
    } catch (error: any) {
      console.error("Athena failed: " + error)
    }
  }

  isPreviouslyTracked(eventName: string, properties: Record<string, any> = {}): boolean {
    return previouslyTrackedEvents.includes(eventName + JSON.stringify(properties))
  }

  addPreviouslyTracked(eventName: string, properties: Record<string, any> = {}): void {
    previouslyTrackedEvents.push(eventName + JSON.stringify(properties))
  }
}
