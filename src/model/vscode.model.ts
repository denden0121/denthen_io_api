import { type UUID } from "node:crypto";

export interface IWorkspace {
	id: UUID,
	room_id: UUID,
	user_code: UUID,
	user_role: 'admin' | 'participant',
	code: Text,
	type: 'document' | 'snippet',
	file_extension: 'html' | 'css' | 'js',
	created_at: string
}

export interface IVscodePayload {
	room_id: UUID,
	user_code: UUID,
	user_role: 'admin' | 'participant',
	code: Text,
	type: 'document' | 'snippet',
	file_extension: 'html' | 'css' | 'js',
}

// CREATE TABLE IF NOT EXISTS workspace (
// 	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
// 	room_id UUID NOT NULL,
// 	user_code UUID NOT NULL,
// 	user_role workspace_user_role NOT NULL,
// 	code TEXT NOT NULL,
// 	type workspace_type NOT NULL,
// 	file_extension workspace_file_extension NOT NULL,
// 	created_at TIMESTAMP DEFAULT NOW()
// );