import { writable } from "svelte/store"

export const notificationsCount = writable(0)
export const notifications = writable<Notification[]>([])
