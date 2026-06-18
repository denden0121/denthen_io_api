import { type UUID } from "node:crypto";

export interface IParticipant {
	id: UUID,
	room_id: string,
	participant_code: UUID,
	username: string,
	joined_at: Date
}

