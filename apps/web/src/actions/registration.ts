"use server";

import { authenticatedAction } from "@/lib/safe-action";
import { db, sql } from "db";
import { del } from "@/lib/utils/server/file-upload";
import z from "zod";
import { returnValidationErrors } from "next-safe-action";
import { registrationFormValidator } from "@/validators/shared/registration";
import { userCommonData, userMetaData } from "db/schema";
import { currentUser } from "@clerk/nextjs/server";
import c, { defaultRoleId } from "config";
import { DatabaseError } from "db/types";
import {
	UNIQUE_KEY_CONSTRAINT_VIOLATION_CODE,
	UNIQUE_KEY_MAPPER_DEFAULT_KEY,
} from "@/lib/constants";

const registerUserSchema = registrationFormValidator;

export const registerHacker = authenticatedAction
	.schema(registerUserSchema)
	.action(async ({ ctx: { userId }, parsedInput }) => {
		const currUser = await currentUser();
		if (!currUser) {
			return returnValidationErrors(z.null(), {
				_errors: ["Unauthorized (No User ID)"],
			});
		}

		try {
			await db.transaction(async (tx) => {
				await tx.insert(userCommonData).values({
					clerkID: userId,
					firstName: parsedInput.firstName,
					lastName: parsedInput.lastName,
					email: parsedInput.email,
					hackerTag: parsedInput.hackerTag,
					age: parsedInput.age,
					firstTimeAttendingRCC: parsedInput.firstTimeAttendingRCC,
					attendeeType: parsedInput.attendeeType,
					isPresenting: parsedInput.isPresenting,
					shirtSize: parsedInput.shirtSize,
					dietRestrictions: parsedInput.dietRestrictions,
					accommodationNote: parsedInput.accommodationNote,
					profilePhoto: currUser.imageUrl,
					isFullyRegistered: true,
					role_id: defaultRoleId,
					acknowledgement: parsedInput.acknowledgement,
				});

				await tx.insert(userMetaData).values({
					clerkID: userId,
					university: parsedInput.university,
					major: parsedInput.major,
					classification: parsedInput.classification,
					universityEmail: parsedInput.universityEmail,
					company: parsedInput.company,
					title: parsedInput.title,
					organizerGroup: parsedInput.organizerGroup,
					presentationName: parsedInput.presentationName,
					heardFrom: parsedInput.heardFrom,
					resume: parsedInput.resume,
				});
			});
		} catch (e) {
			// Catch duplicates because they will be based off of the error code 23505
			if (
				parsedInput.resume != null &&
				parsedInput.resume != c.noResumeProvidedURL
			) {
				console.log(parsedInput.resume);
				console.log("deleting resume");

				await del(parsedInput.resume);
			}
			if (
				e instanceof DatabaseError &&
				e.code === UNIQUE_KEY_CONSTRAINT_VIOLATION_CODE
			) {
				console.error(e);
				const constraintKeyIndex =
					e.constraint as keyof typeof c.db.uniqueKeyMapper;
				return {
					success: false,
					message:
						c.db.uniqueKeyMapper[
							constraintKeyIndex ?? UNIQUE_KEY_MAPPER_DEFAULT_KEY
						] ?? e.detail,
				};
			} else {
				console.log(e);
				throw e;
			}
		}

		return {
			success: true,
			message: "Registration created successfully",
		};
	});
