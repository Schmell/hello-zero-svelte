<script lang="ts">
	import { formatDate } from '$lib/date'
	import { randInt } from '$lib/rand'
	import { randomMessage } from '$lib/test-data'
	import { queries } from '$lib/zero/queries'
	import type { Message } from '$lib/zero/schema'
	import { useZero } from '$lib/zero/zero.svelte'

	let { data } = $props()

	let filterUser = $state('')
	let filterMedium = $state('')
	let filterText = $state('')
	let filterDate = $state('')
	let action = $state<'add' | 'remove' | undefined>(undefined)
	let user_dialog = $state<HTMLDialogElement>()

	const zero = useZero(data.userID)
	const users = zero.createQuery(queries.allUsers())
	const mediums = zero.q(queries.allMediums()) // Using q alias!
	const all_messages = zero.q(queries.allMessages())
	const visible_messages = zero.q(queries.filteredMessages({}))
	const current_user = zero.q(queries.getUser(''))
	let current_user_messages = zero.q(queries.getUserMessages(''))

	let more = zero.q(queries.getUserMessages(''))

	type Filters = {
		senderID?: string
		mediumID?: string
		body?: string
		timestamp?: string
	}

	function applyFilter({ senderID, mediumID, body, timestamp }: Filters) {
		visible_messages.updateQuery(queries.filteredMessages({ senderID, mediumID, body, timestamp }))
	}

	function hasFilters() {
		return filterUser || filterMedium || filterText || filterDate
	}

	$effect(() => {
		if (action !== undefined) {
			const interval = setInterval(() => {
				if (!handleAction()) {
					clearInterval(interval)
					action = undefined
				}
			}, 1000 / 60)
		}
	})

	function handleAction() {
		if (action === undefined) {
			return false
		}
		if (action === 'add') {
			zero.mutate.message.create(randomMessage(users.data, mediums.data))
			return true
		} else {
			const messages = all_messages.data
			if (messages.length === 0) {
				return false
			}
			const index = randInt(messages.length)
			zero.mutate.message.delete(messages[index].id)
			return true
		}
	}

	function stopAction() {
		action = undefined
	}

	function addMessages() {
		action = 'add'
	}

	function removeMessages(e: MouseEvent) {
		if (zero.userID === 'anon' && !e.shiftKey) {
			alert('You must be logged in to delete. Hold the shift key to try anyway.')
			return
		}
		action = 'remove'
	}

	function editMessage(e: MouseEvent, id: string, senderID: string, prev: string) {
		if (senderID !== zero.userID && !e.shiftKey) {
			alert(
				"You aren't logged in as the sender of this message. Editing won't be permitted. Hold the shift key to try anyway."
			)
			return
		}
		const body = prompt('Edit message', prev)
		zero.mutate.message.update({
			id,
			body: body ?? prev,
		})
	}

	async function toggleLogin() {
		await fetch('/api/zero/login')
		location.reload()
	}

	// If initial sync hasn't completed, these can be empty.
	function initialSyncComplete() {
		return users.data.length && mediums.data.length
	}

	function user() {
		return users.data.find((user) => user.id === zero.userID)?.name ?? 'anon'
	}
</script>

{#if !initialSyncComplete()}
	<div style="margin: auto;">Loading........</div>
	<progress>Loading</progress>
{:else}
	<div class="controls">
		<div>
			<button onmousedown={addMessages} onmouseup={stopAction}> Add Messages </button>
			<button onmousedown={removeMessages} onmouseup={stopAction}> Remove Messages </button>
			<em>(hold buttons to repeat)</em>
		</div>
		<div style="justify-content: end">
			{user() === 'anon' ? '' : `Logged in as ${user()}`}
			<button onmousedown={() => toggleLogin()}>
				{user() === 'anon' ? 'Login' : 'Logout'}
			</button>
		</div>
	</div>
	<div class="controls">
		<div>
			From:
			<select
				onchange={({ currentTarget }) => applyFilter({ senderID: currentTarget.value })}
				style=" flex: 1"
			>
				<option value="">Sender</option>
				{#each users.data as user}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</div>
		<div>
			By:
			<select
				onchange={({ currentTarget }) => applyFilter({ mediumID: currentTarget.value })}
				style="flex: 1"
			>
				<option value="">Medium</option>
				{#each mediums.data as medium}
					<option value={medium.id}>{medium.name}</option>
				{/each}
			</select>
		</div>
		<div>
			Contains:
			<input
				type="text"
				placeholder="message"
				oninput={({ currentTarget }) => applyFilter({ body: currentTarget.value })}
				style="flex: 1"
			/>
		</div>
		<div>
			After:
			<input
				type="date"
				oninput={({ currentTarget }) => (filterDate = currentTarget.value)}
				style="flex: 1"
			/>
		</div>
	</div>

	<div class="controls">
		<em>
			{#if hasFilters()}
				<div>Showing all {visible_messages.data.length} messages</div>
			{:else}
				<div>
					Showing {visible_messages.data.length} of {all_messages.data.length}{' '}
					messages. Try opening{' '}
					<a href="/" target="_blank"> another tab </a>{' '}
					to see them all!
				</div>
			{/if}
		</em>
	</div>

	{#if visible_messages.data.length === 0}
		<h3>
			<em>No posts found 😢</em>
		</h3>
	{:else}
		<table class="messages">
			<thead>
				<tr>
					<th>Sender</th>
					<th>Medium</th>
					<th>Message</th>
					<th>Sent</th>
					<th>Edit</th>
				</tr>
			</thead>
			<tbody>
				{#each visible_messages.data as message}
					<tr>
						<td
							><a
								href="##"
								onclick={() => {
									current_user.updateQuery(queries.getUser(message.senderID))
									current_user_messages.updateQuery(queries.getUserMessages(message.senderID))
									user_dialog?.showModal()
								}}
							>
								{message.sender?.name}
							</a>
						</td>
						<td>{message.medium?.name}</td>
						<td>{message.body}</td>
						<td>{formatDate(message.timestamp)}</td>
						<td
							onmousedown={(e: MouseEvent) =>
								editMessage(e, message.id, message.senderID, message.body)}
						>
							✏️
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	<!-- filteredMessages.data.length === 0 -->
{/if}
<!-- initialSyncComplete() -->

<dialog bind:this={user_dialog}>
	<h2>{current_user.data?.name}</h2>
	Partner: {current_user.data?.partner}
	<ul>
		{#each current_user_messages.data as message}
			<li>{message.body}</li>
		{/each}
	</ul>
	<button
		onclick={() => {
			more = zero.q(
				queries.getUserMessages(
					current_user.data?.id!,
					current_user_messages.data[current_user_messages.data.length - 1]
				)
			)

			// current_user_messages.updateQuery(
			// 	queries.getUserMessages(
			// 		current_user.data?.id!,
			// 		current_user_messages.data[current_user_messages.data.length - 1]
			// 	)
			// )
		}}
	>
		Load More
	</button>
	<form method="dialog">
		<button>OK</button>
	</form>
</dialog>
