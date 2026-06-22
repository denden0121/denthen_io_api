import { z } from "zod";

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