import type { Transaction } from '@rocicorp/zero'
import { must } from './must'
import type { Message, MessageUpdate, Schema } from './schema'

export function createMutators(userID: string) {
	return {
		message: {
			async create(tx: Transaction<Schema>, message: Message) {
				await tx.mutate.message.insert(message)
			},
			async delete(tx: Transaction<Schema>, id: string) {
				mustBeLoggedIn(userID)
				await tx.mutate.message.delete({ id })
			},
			async update(tx: Transaction<Schema>, message: MessageUpdate) {
				mustBeLoggedIn(userID)
				const previous_message = await tx.query.message.where('id', message.id).one().run()
				if (!previous_message?.senderID) {
					console.error('No previous_message senderID')
					return
				}
				console.log('Client mutator: ', previous_message.senderID, userID)
				if (tx.location === 'client' && previous_message.senderID !== userID) {
					throw new Error('Must be sender of message to edit')
				}

				await tx.mutate.message.update(message)
			},
		},
	}
}

function mustBeLoggedIn(userID: string) {
	must(userID, 'Must be logged in')
}

export type ClientMutators = ReturnType<typeof createMutators>
