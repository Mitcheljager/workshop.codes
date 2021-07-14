import { writable } from "svelte/store"

export let notificationsCount = writable(0)
export let notifications = writable([])
