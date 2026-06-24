import { z } from "zod";



// const payload = {
// 	userId: data.user.id,
// 	roomId: data.user.room_id,
// 	username: data.user.username,
// 	role: data.user.role
// }
export const HandleDocumentSchema = z.object({
	code: z.string(),
	type: z.enum(["document", "snippet"]),
	fileExtension: z.enum(["html", "css", "js"]),
})


// export const HandleDocumentSchema = z.object({
// 	roomId: z.uuid(),
// 	userCode: z.uuid(),
// 	userRole: z.enum(["admin", "participant"]),
// 	code: z.string(),
// 	type: z.enum(["document", "snippet"]),
// 	fileExtension: z.enum(["html", "css", "js"]),
// })



export type HandleDocumentSchemaInput = z.infer<typeof HandleDocumentSchema>;