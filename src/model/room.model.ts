import { type UUID } from "node:crypto";

export interface IRoom {
	id: UUID,
	room_code: string,
	admin_code: UUID,
	username: string,
	is_active: boolean,
	last_activity: Date,
	created_at: Date,
}

export interface ICreateRoomResponse {
	room_code: string,
	admin_code: UUID,
	username: string
}

			// userId: data.user.id,
			// roomId: data.user.room_id,
			// username: data.user.username,
			// role: data.user.role
export interface IMyTokenPayload {
    userId: string,
	roomId: string,
    username: string,
    role: 'admin' | 'participant',
}
export interface ITRoom {
	id: UUID,
	room_code: Text,
	is_active: Boolean,
	last_activity: string,
	created_at: string,	
}

