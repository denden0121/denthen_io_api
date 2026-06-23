import { z } from "zod";

export const CreateTUserSchema = z.object({
	username: z.string({message: "Username must be a text"})
				.min(2, "Username must contain alteast 2 characters")
});