import pool from "@/config/db.js";
import type { UUID } from "node:crypto";

export const createParticipant = async (roomCode: UUID, username: string) => {
	try {
        const { rows } = await pool.query(
            'INSERT INTO participant (room_id, username) VALUES ($1, $2) RETURNING *',
            [roomCode, username]
        );
        return rows[0]; 
    } catch (error) {
        console.error("Model Error:", error);
        throw error; 
    }
  
};