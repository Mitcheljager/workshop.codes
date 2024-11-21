<script>
  import { onMount } from "svelte"
  import * as timeago from "timeago.js"

  import FetchRails from "@src/fetch-rails"
  import { notifications, notificationsCount } from "@stores/notifications"

  import Bell from "@components/icon/Bell.svelte"

  export let viewAllPath

  let active = false
  let loading = true

  onMount(() => {
    $notifications = []
    getUnreadCount()
  })

  function getNotifications() {
    active = true

    setTimeout(() => { active = false }, 1000)

    if (loading == false) return

    $notificationsCount = 0

    new FetchRails("/unread-notifications").get()
      .then(data => {
        loading = false
        $notifications = JSON.parse(data)
      })
  }

  function getUnreadCount() {
    new FetchRails("/unread-notifications-count").get()
      .then(data => $notificationsCount = parseInt(data))
  }
</script>

<div class="notifications dropdown lg-down:dropup mb-1/8 mbl:mb-0 mbl:mr-1/8" data-dropdown>
  <button data-action="toggle-dropdown" aria-label="Notifications" on:click={getNotifications}>
    <div class="notifications__label">
      <Bell animating={active} />
    </div>

    {#if $notificationsCount}
      <div class="notifications__bubble">{$notificationsCount}</div>
    {/if}
  </button>

  <div class="dropdown__content dropdown__content--large pt-0" data-dropdown-content>
    <div class="dropdown__header">
      <h4 class="mt-0 mb-0">Notifications</h4>

      <a href={viewAllPath} class="button button--link button--small" aria-label="View all notifications">View all</a>
    </div>

    {#if loading}
      <span class="dropdown__item"><div class="spinner spinner--small mb-1/8"/></span>
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
</div>
