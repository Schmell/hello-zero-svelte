import { escapeLike, syncedQuery, syncedQueryWithContext } from '@rocicorp/zero'
import z from 'zod'
import { builder, type Message } from './schema'

export const queries = {
	allUsers: syncedQuery('user', z.tuple([]), () => builder.user),

	getUser: syncedQueryWithContext('sender', z.tuple([z.string()]), (ctx: any, id: string = '') => {
		return builder.user.where('id', id).one()
	}),

	allMediums: syncedQuery('medium', z.tuple([]), () => builder.medium),

	getMedium: syncedQuery('user_medium', z.tuple([z.string()]), (id: string) =>
		builder.medium.where('id', id).one()
	),

	allMessages: syncedQuery('messages', z.tuple([]), () =>
		builder.message.orderBy('timestamp', 'desc')
	),

	getUserMessages: syncedQuery(
		'user_messages',
		z.tuple([z.string(), z.any().optional(), z.number().nonnegative().optional()]),
		(senderID: string, start?: Message, limit: number = 10) => {
			let q = builder.message.where('senderID', senderID).limit(limit)
			if (start) {
				q = q.start(start)
			}
			return q
		}
	),

	filteredMessages: syncedQuery(
		'filteredMessages',
		z.tuple([
			z.object({
				senderID: z.string().optional(),
				mediumID: z.string().optional(),
				body: z.string().optional(),
				timestamp: z.number().optional(),
				orderBy: z
					.object({
						col: z.enum(['id', 'senderID', 'mediumID', 'body', 'timestamp']),
						dir: z.enum(['asc', 'desc']),
					})
					.optional(),
			}),
		]),
		({ senderID, mediumID, body, timestamp, orderBy }) => {
			let q = builder.message.related('medium', (q) => q.one()).related('sender', (q) => q.one())

			if (senderID) {
				q = q.where('senderID', senderID)
			}
			if (mediumID) {
				q = q.where('mediumID', mediumID)
			}
			if (body) {
				q = q.where('body', 'LIKE', `%${escapeLike(body)}%`)
			}
			if (timestamp) {
				q = q.where('timestamp', '>=', timestamp ? new Date(timestamp).getTime() : 0)
			}
			if (orderBy) {
				q = q.orderBy(orderBy.col, orderBy.dir)
			}

			return q
		}
	),
}

export type FilteredMessages = ReturnType<typeof queries.filteredMessages>
