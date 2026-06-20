import { z } from "zod";

export const CreateRoomSchema = z.object({
    username: z.string({ message: "Username must be text" })
               .min(2, "Username must be at least 2 characters long"),
});


export const SpecialKeyPayloadSchema = z.object({
	role: z.enum(["admin", "participant"]),
	code: z.string(),
	id: z.uuid("Invalid ID format"),
	username: z.string()
})

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type SpecialKeyPayloadInput = z.infer<typeof SpecialKeyPayloadSchema>;