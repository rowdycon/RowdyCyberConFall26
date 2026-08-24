import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { EventTypeEnum } from "@/lib/types";
import { events } from "db/schema";
import z from "zod";
import c from "config";

const defaultSelectPrettyError = c.zod.defaultSelectPrettyError;
const defaultInputPrettyError = c.zod.defaultInputPrettyError;

export const newEventFormSchema = createInsertSchema(events, {
	title: z.string().min(1, defaultInputPrettyError),
	description: z.string().min(1, defaultInputPrettyError),
	startTime: z.date(),
	endTime: z.date(),
	host: z.string().max(255).nullable(),
	type: z.enum(
		Object.keys(c.eventTypes) as EventTypeEnum,
		defaultSelectPrettyError,
	),
}).refine(({ startTime, endTime }) => startTime < endTime, {
	message: "Start time must be before end time",
	path: ["startTime"],
});

export const editEventFormSchema = newEventFormSchema;

export const eventDataTableValidator = createSelectSchema(events);
