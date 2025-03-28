<script lang="ts">
  import { onMount } from "svelte"
  import { fly, scale } from "svelte/transition"
  import * as timeago from "timeago.js"

  import FetchRails from "@src/fetch-rails"
  import { notifications, notificationsCount } from "@stores/notifications"

  import Bell from "@components/icon/Bell.svelte"
  import { outsideClick } from "@components/actions/outsideClick"

  interface Props { viewAllPath: string }

  const { viewAllPath = "" }: Props = $props()

  let active = $state(false)
  let animating = $state(false)
  let loading = $state(true)

  onMount(() => {
    $notifications = []
    getUnreadCount()
  })

  function toggle(): void {
    if (window.innerWidth < 768) {
      window.location.href = viewAllPath
      return
    }

    active = !active
    if (active) animate()

    if (loading) getNotifications()
  }

  async function getNotifications(): Promise<void> {
    $notificationsCount = 0

    try {
      const data = await new FetchRails("/unread-notifications").get()

      $notifications = JSON.parse(data as string)
    } finally {
      loading = false
    }
  }

  async function getUnreadCount(): Promise<void> {
    const data = await new FetchRails("/unread-notifications-count").get()

    $notificationsCount = parseInt(data as string)
  }

  function animate(): void {
    animating = true
    setTimeout(() => { animating = false }, 1000)
  }
</script>

<div class="notifications dropdown lg-down:dropup" use:outsideClick={{ onOutsideClick: () => active = false }}>
  <button data-action="toggle-dropdown" aria-label="Notifications" onclick={() => toggle()}>
    <div class="notifications__bell">
      <Bell {animating} />

      <span class="notifications__label">
        Notifications
      </span>
    </div>

    {#if $notificationsCount}
      <div class="notifications__bubble">{$notificationsCount}</div>
    {/if}
  </button>

  {#if active}
    <div class="dropdown__content dropdown__content--large active pt-0" transition:fly={{ y: 10, duration: 100 }}>

      <div class="dropdown__header">
        <h4 class="mt-0 mb-0">Notifications</h4>

        <a href={viewAllPath} class="button button--link button--small" aria-label="View all notifications">View all</a>
      </div>

      {#if loading}
        <span class="dropdown__item"><div class="spinner spinner--small mt-1/8 mb-1/16" aria-live="polite" role="status"></div></span>
      {/if}

      {#each $notifications as notification}
        <div class="notifications__item">
          <small class="text-dark" title={notification.created_at}>
            {timeago.format(notification.created_at)}
          </small>

          {@html notification.content}

          {#if notification.go_to}
            <a href={notification.go_to} class="button button--small button--thin button--dark mt-1/8">
              View
            </a>
          {/if}
        </div>
      {/each}

      {#if !$notifications.length && !loading}
        <small class="dropdown__item mt-1/8 text-base">
          You have no unread notifications
        </small>
      {/if}
    </div>
  {/if}
</div>
