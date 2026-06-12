import pool from "@/config/db.js";
import type { UUID } from "node:crypto";

export const createRoom = async (username: string) => {
	try {
        const { rows } = await pool.query(
            'INSERT INTO room (username) VALUES ($1) RETURNING room_code, admin_code',
            [username]
        );
        return rows[0]; 
    } catch (error) {
        console.error("Model Error:", error);
        throw error; 
    }
  
};

export const selectRoom = async (room_code: UUID, user_code: UUID) => {
	try {
		const queryText = 'SELECT * FROM room WHERE room_code = $1 AND admin_code = $2;';
        
        const { rows } = await pool.query(queryText, [room_code, user_code]);
        
        return rows[0];
	} catch (error) {
        return null;
	}
}