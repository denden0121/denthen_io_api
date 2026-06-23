import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type ICreateRoomResponse, type IRoom, type ITRoom } from "@/model/room.model.js";
import { type ITUser } from "@/model/user.model.js";
import { type IParticipant } from "@/model/participant.model.js";
import { AppError } from "@/util/appError.js";

export const createNewAdmin = async (room: ITRoom, username: string): Promise<ITUser>  => {
	try {
		const roomId = room.id;
		const { rows } = await pool.query<ITUser>(
			'INSERT INTO t_user (room_id, username, role) VALUES ($1, $2, $3) RETURNING *',
			[roomId, username, 'admin']
		);
		if (rows.length === 0) {
			throw new AppError(400, 'Username/Admin already exist in this room.');
		}
		if (!rows) {
			throw new AppError(500, 'Server problem: No data inserted to database.');
		}
		return rows[0]!; 
	} catch (error) {
		throw error; 
	}
};

export const createNewRoom = async (roomCode: string): Promise<ITRoom>  => {
	try {
		const { rows } = await pool.query<ITRoom>(
			'INSERT INTO t_room (room_code) VALUES ($1) ON CONFLICT (room_code) DO NOTHING RETURNING *',
			[roomCode]
		);
		if (rows.length === 0) {
			throw new AppError(400, 'Room code already exist: No data inserted to database.');
		}
		if (!rows) {
			throw new AppError(500, 'Server problem: No data inserted to database.');
		}
		return rows[0]!; 
	} catch (error) {
		throw error; 
	}
};

export const createNewRoomWithAdmin = async (roomCode: string, username: string) => {
	try {
		const newRoomData = await createNewRoom(roomCode);
		const newAdminData = await createNewAdmin(newRoomData, username);

		return {
			room: newRoomData,
			user: newAdminData
		}
	} catch (error) {
		return error;
	}
}

export const checkRoomCode = async (roomCode: string): Promise<ITRoom> => {
	try {
		const queryText = 'SELECT * FROM t_room WHERE room_code = $1;';
        const { rows } = await pool.query<ITRoom>(queryText, [roomCode]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Room does not exits in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}

export const selectRoomAsAdmin = async (room_code: string, admin_code: string): Promise<ICreateRoomResponse> => {
	try {
		const queryText = 'SELECT * FROM room WHERE room_code = $1 AND admin_code = $2;';
        const { rows } = await pool.query<ICreateRoomResponse>(queryText, [room_code, admin_code]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to select room  in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}


export const selectRoomAsParticipant = async (room_id: string, username: string): Promise<IParticipant> => {
	try {
		const queryText = 'SELECT * FROM participant WHERE room_id = $1 AND username = $2;';
        const { rows } = await pool.query<IParticipant>(queryText, [room_id, username]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to select participant in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}

export const selectAdminCode = async (room_code: string, username: string) => {
	try {
		const queryText = 'SELECT admin_code FROM room WHERE room_code = $1 AND username = $2;';
        const { rows } = await pool.query(queryText, [room_code, username]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to select admin code in the database.");
		}
        return {
			adminCode: rows[0].admin_code!,
			role: "admin"

		}
	} catch (error) {
		throw error; 
	}
}

export const selectParticipantCode = async (room_code: string, username: string) => {
	try {
		const response = await checkRoomCode(room_code);
		console.log("check participant room", response.id);
		const queryText = 'SELECT participant_code FROM participant WHERE room_id = $1 AND username = $2;';
        const { rows } = await pool.query(queryText, [response.id, username]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to select participant code in the database.");
		}
        return {
			adminCode: rows[0].participant_code!,
			role: "participant"
		}
	} catch (error) {
		throw error; 
	}
}


// export const selectRoomAsParticipant = async (room_id: UUID, participant_code: UUID): Promise<IParticipant> => {
// 	try {
// 		const queryText = 'SELECT * FROM participant WHERE room_id = $1 AND participant_code = $2;';
//         const { rows } = await pool.query<IParticipant>(queryText, [room_id, participant_code]);
// 		if (!rows || rows.length === 0) {
//             throw new AppError(500, "Failed to create room entry in the database.");
// 		}
//         return rows[0]!;
// 	} catch (error) {
// 		throw error; 
// 	}
// }



export const checkRoomId = async (id: string): Promise<IRoom> => {
	try {
		const queryText = 'SELECT room_code FROM room WHERE id = $1;';
        const { rows } = await pool.query<IRoom>(queryText, [id]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Room does not exits in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}