import { must } from '$lib/zero/must'
import { randomInt } from 'crypto'
import { AUTH_SECRET } from '$env/static/private'
import type { RequestEvent } from '@sveltejs/kit'

// See seed.sql
// In real life you would of course authenticate the user however you like.
const userIDs = [
	'6z7dkeVLNm',
	'ycD76wW4R2',
	'IoQSaxeVO5',
	'WndZWmGkO4',
	'ENzoNm7g4E',
	'dLKecN3ntd',
	'7VoEoJWEwn',
	'enVvyDlBul',
	'9ogaDuDNFx',
]

const secretKey = must(AUTH_SECRET, 'required env var AUTH_SECRET')

export async function GET({ cookies }: RequestEvent) {
	const cookie = cookies.get('auth')
	// Because its a toggleLogin
	if (cookie) {
		cookies.delete('auth', { path: '/' })
		return Response.json('ok')
	}

	const userID = userIDs[randomInt(userIDs.length)]
	cookies.set('auth', userID, { path: '/', httpOnly: false })
	return Response.json('ok')
}
