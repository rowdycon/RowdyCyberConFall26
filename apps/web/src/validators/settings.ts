import z from "zod";
import { isProfane } from "no-profanity";
import c from "config";

const noProfanityValidator = (val: any) => !isProfane(val);
const noProfanityMessage = "Profanity is not allowed";

const defaultSelectPrettyError = c.zod.defaultSelectPrettyError;
const defaultInputPrettyError = c.zod.defaultInputPrettyError;

export const modifyAccountSettingsSchema = z.object({
	firstName: z.string().min(1, defaultInputPrettyError).max(50),
	lastName: z.string().min(1, defaultInputPrettyError).max(50),
	hackerTag: z
		.string()
		.min(1, defaultInputPrettyError)
		.max(50)
		.refine(noProfanityValidator, noProfanityMessage),
});

export const registrationSettingsFormSchema = z.object({
	age: z.coerce
		.number()
		.min(18, {
			message: "You must be at least 18 years old to register.",
		})
		.max(100, {
			message: "You have entered a number far too high.",
		})
		.int({
			message: "Value must be an integer",
		}),
	firstTimeAttendingRCC: z.boolean(),
	attendeeType: z
		.enum(c.registration.attendeeTypes, defaultSelectPrettyError)
		.optional(),
	university: z
		.enum(c.registration.schools, defaultSelectPrettyError)
		.optional()
		.or(z.literal("").transform(() => undefined)),
	major: z
		.enum(c.registration.majors, defaultSelectPrettyError)
		.optional()
		.or(z.literal("").transform(() => undefined)),
	classification: z
		.enum(c.registration.classifications, defaultSelectPrettyError)
		.optional()
		.or(z.literal("").transform(() => undefined)),
	universityEmail: z
		.string()
		.email({
			message: "Email must be a valid email (eg: me@example.com",
		})
		.max(255, {
			message: "Email must be less than 255 characters.",
		})
		.optional()
		.or(z.literal("").transform(() => undefined)),
	company: z.string().optional(),
	title: z.string().optional(),
	organizerGroup: z
		.enum(c.registration.organizerGroups, defaultSelectPrettyError)
		.optional(),
	shirtSize: z.enum(
		c.registration.shirtSizeOptions,
		defaultSelectPrettyError,
	),
	isPresenting: z.boolean().optional(),
	presentationName: z.string().optional(),
	heardFrom: z.enum(
		c.registration.heardFromOptions,
		defaultSelectPrettyError,
	),
	accommodationNote: z
		.string()
		.max(c.registration.maxaccommodationNoteSize, {
			message: `Accommodation note cannot be more than ${c.registration.maxaccommodationNoteSize} characters.`,
		})
		.optional(),
	dietRestrictions: z
		.array(
			z.enum(
				c.registration.dietaryRestrictionOptions,
				defaultSelectPrettyError,
			),
		)
		.optional(),
	uploadedFile: z.string().optional(),
});

const registrationSettingsConditionalValidation = (
	data: z.infer<typeof registrationSettingsFormSchema>,
	ctx: z.RefinementCtx,
) => {
	if (data.attendeeType === "University Student") {
		if (!data.university) {
			ctx.addIssue({
				code: "custom",
				path: ["university"],
				message: "University is required for university students.",
			});
		}

		if (!data.major) {
			ctx.addIssue({
				code: "custom",
				path: ["major"],
				message: "Major is required for university students.",
			});
		}

		if (!data.classification) {
			ctx.addIssue({
				code: "custom",
				path: ["classification"],
				message: "Classification is required for university students.",
			});
		}

		if (!data.universityEmail?.trim()) {
			ctx.addIssue({
				code: "custom",
				path: ["universityEmail"],
				message:
					"University email is required for university students.",
			});
		}
	}

	if (data.attendeeType === "Cyber Professional") {
		if (!data.company?.trim()) {
			ctx.addIssue({
				code: "custom",
				path: ["company"],
				message: "Company is required for cyber professionals.",
			});
		}

		if (!data.title?.trim()) {
			ctx.addIssue({
				code: "custom",
				path: ["title"],
				message: "Title is required for cyber professionals.",
			});
		}
	}

	if (data.attendeeType === "Student Organizer") {
		if (!data.organizerGroup) {
			ctx.addIssue({
				code: "custom",
				path: ["organizerGroup"],
				message: "Organizer group is required for student organizers.",
			});
		}
	}

	if (data.isPresenting === true && !data.presentationName?.trim()) {
		ctx.addIssue({
			code: "custom",
			path: ["presentationName"],
			message: "Presentation name is required when presenting.",
		});
	}
};

export const registrationSettingsFormValidator =
	registrationSettingsFormSchema.superRefine(
		registrationSettingsConditionalValidation,
	);
