import type { ClientMutators } from '$lib/zero/mutators.svelte'
import type { Message, Schema } from '$lib/zero/schema'
import type { ServerTransaction } from '@rocicorp/zero'
import type { TransactionSql } from 'postgres'

type MutatorTx = ServerTransaction<Schema, TransactionSql>

export function createServerMutators(
	clientMutators: ClientMutators,
	asyncTasks?: Array<() => Promise<void>>
) {
	return {
		// Reuse all client mutators except the ones in `issue`
		...clientMutators,

		message: {
			// Reuse all issue mutators except `update`
			...clientMutators.message,

			update: async (tx: MutatorTx, message: Message) => {
				const previous_message = await tx.query.message.where('id', message.id).one().run()
				if (!previous_message?.senderID) {
					console.error('No previous_message senderID')
					return
				}

				asyncTasks?.push(async () => {
					//
				})

				// reuse the client mutator
				await clientMutators.message.update(tx, message)
			},
		},
	} as const
}

export type CreateServerMutators = ReturnType<typeof createServerMutators>
