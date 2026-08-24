import { userCommonData, userMetaData } from "./schema";
import { createInsertSchema } from "drizzle-zod";

export const userCommonDataInsertSchema = createInsertSchema(userCommonData);
export const userMetaDataInsertSchema = createInsertSchema(userMetaData);

export const userWithDataInsertSchema = userCommonDataInsertSchema.merge(
	userMetaDataInsertSchema,
);
