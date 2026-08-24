import z from "zod";
import { isProfane } from "no-profanity";

const noProfanityValidator = (val: any) => !isProfane(val);
const noProfanityMessage = "Profanity is not allowed";

export const modifyAccountSettingsSchema = z.object({
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	hackerTag: z
		.string()
		.min(1)
		.max(50)
		.refine(noProfanityValidator, noProfanityMessage),
});

const defaultPrettyError = {
	errorMap: () => ({ message: "Please select a value" }),
};

export const registrationSettingsFormValidator = z.object({
	age: z
		.number()
		.min(18, { message: "You must be at least 18 years old to register." })
		.positive({ message: "Value must be positive" })
		.int({ message: "Value must be an integer" })
		.or(z.string())
		.pipe(
			z.coerce
				.number()
				.min(18, {
					message: "You must be at least 18 years old to register.",
				})
				.positive({ message: "Value must be positive" })
				.int({ message: "Value must be an integer" }),
		),
	university: z.string().min(1).max(200),
	major: z.string().min(1).max(200),
	classification: z.union([
		z.literal("Freshman", defaultPrettyError),
		z.literal("Sophomore", defaultPrettyError),
		z.literal("Junior", defaultPrettyError),
		z.literal("Senior", defaultPrettyError),
		z.literal("Recent Grad", defaultPrettyError),
		z.literal("Other", defaultPrettyError),
	]),
	heardAboutEvent: z
		.union([
			z.literal("Instagram"),
			z.literal("Class Presentation"),
			z.literal("Twitter"),
			z.literal("Event Site"),
			z.literal("Friend"),
			z.literal("Other"),
		])
		.optional(),
	shirtSize: z.union([
		z.literal("S", defaultPrettyError),
		z.literal("M", defaultPrettyError),
		z.literal("L", defaultPrettyError),
		z.literal("XL", defaultPrettyError),
		z.literal("2XL", defaultPrettyError),
		z.literal("3XL", defaultPrettyError),
	]),
	dietaryRestrictions: z.array(z.string()),
	accommodationNote: z.string().optional(),
	uploadedFile: z.string().optional(),
});
