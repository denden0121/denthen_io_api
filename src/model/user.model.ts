import { type UUID } from "node:crypto";

export interface ITUser {
	id: UUID,
	room_id: UUID,
	username: string,
	role: 'admin' | 'participant',
	joined_at: string,
}