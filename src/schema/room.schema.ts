import { z } from "zod";

export const CreateRoomSchema = z.object({
    username: z.string({ message: "Username must be text" })
               .min(2, "Username must be at least 2 characters long"),
});

export const CreateParticipantSchema = z.object({
	roomCode: z.string().min(8, "Room Code must be at least 8 characters long"),
	username: z.string({ message: "Username must be text" })
               .min(2, "Username must be at least 2 characters long"),
})

export const JoinRoomSchema = z.object({
	specialKey: z.string({})
})

export const SpecialKeyPayloadSchema = z.object({
	role: z.enum(["admin", "participant"]),
	code: z.string(),
	username: z.string()
})

export const AccessTokenSchema = z.string()
export const RefreshTokenSchema = z.string()

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type SpecialKeyPayloadInput = z.infer<typeof SpecialKeyPayloadSchema>;
export type RefreshTokenSchemaInput = z.infer<typeof RefreshTokenSchema>;

//new schema
export const CreateTRoomSchema = z.object({
	username: z.string({message: "Username must be a text"})
				.min(2, "Username must be atleast 2 characters long")
});

export type CreateTRoomInput = z.infer<typeof CreateTRoomSchema>;