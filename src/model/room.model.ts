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

export interface IMyTokenPayload {
    roomCode: string;
    username: string;
    userRole: 'admin' | 'participant'; 
}

export interface ITRoom {
	id: UUID,
	room_code: Text,
	is_active: Boolean,
	last_activity: string,
	created_at: string,	
}

