import z from "zod";
import c from "config";
import { isProfane } from "no-profanity";

const noProfanityValidator = (val: any) => !isProfane(val);
const noProfanityMessage = "Profanity is not allowed";
const defaultSelectPrettyError = c.zod.defaultSelectPrettyError;
const defaultInputPrettyError = c.zod.defaultInputPrettyError;

export const uploadResumeSchema = z.object({
	resumeFile: z.instanceof(File),
});

export const registrationFormSchema = z.object({
	firstName: z.string().min(1, defaultInputPrettyError).max(50, {
		message: "First name must be between 1 and 50 characters",
	}),
	lastName: z.string().min(1, defaultInputPrettyError).max(50, {
		message: "Last name must be between 1 and 50 characters",
	}),
	email: z
		.string()
		.email({
			message: "Email must be a valid email (eg: me@example.com",
		})
		.max(255, {
			message: "Email must be less than 255 characters.",
		}),
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
	hackerTag: z
		.string()
		.min(3, {
			message: "Your username must be more than 3 characters long",
		})
		.max(20, {
			message: "Your username cannot be more than 20 characters long",
		})
		.regex(c.registration.hackerTagRegex, {
			message: "Username must be alphanumeric and have no spaces",
		})
		.toLowerCase()
		.refine(noProfanityValidator, noProfanityMessage),
	firstTimeAttendingRCC: z.boolean(),
	attendeeType: z.enum(
		c.registration.attendeeTypes,
		defaultSelectPrettyError,
	),

	university: z
		.enum(c.registration.schools, defaultSelectPrettyError)
		.optional(),
	major: z.enum(c.registration.majors, defaultSelectPrettyError).optional(),
	classification: z
		.enum(c.registration.classifications, defaultSelectPrettyError)
		.optional(),
	universityEmail: z
		.string()
		.email({
			message: "Email must be a valid email (eg: me@example.com",
		})
		.max(255, {
			message: "Email must be less than 255 characters.",
		})
		.optional(),
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
	dietRestrictions: z
		.array(
			z.enum(
				c.registration.dietaryRestrictionOptions,
				defaultSelectPrettyError,
			),
		)
		.optional(),
	accommodationNote: z
		.string()
		.max(c.registration.maxaccommodationNoteSize, {
			message: `Accommodation note cannot be more than ${c.registration.maxaccommodationNoteSize} characters.`,
		})
		.optional(),
	resume: z
		.string()
		.max(255, {
			message: "Resume path cannot be more than 255 characters.",
		})
		.optional(),
	acknowledgement: z.boolean(),
});

const registrationConditionalValidation = (
	data: z.infer<typeof registrationFormSchema>,
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

export const registrationFormValidator = registrationFormSchema.superRefine(
	registrationConditionalValidation,
);

export const registrationValidatorLocalStorage = registrationFormSchema
	.extend({
		age: z.number().or(z.string()).pipe(z.coerce.number()),
		accommodationNote: z.string(),
	})
	.superRefine(registrationConditionalValidation);

export const registrationResumeValidator = z.object({
	fileName: z.string().min(1, defaultInputPrettyError),
	fileString: z.string().min(1, defaultInputPrettyError),
});
