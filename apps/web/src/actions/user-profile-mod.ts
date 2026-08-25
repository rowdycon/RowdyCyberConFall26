"use server";

import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "db";
import { userCommonData, userMetaData } from "db/schema";
import { eq } from "db/drizzle";
import { del } from "@/lib/utils/server/file-upload";
import { decodeBase64AsFile } from "@/lib/utils/shared/files";
import { revalidatePath } from "next/cache";
import { UNIQUE_KEY_CONSTRAINT_VIOLATION_CODE } from "@/lib/constants";
import c from "config";
import { DatabaseError } from "db/types";
import {
	registrationSettingsFormValidator,
	modifyAccountSettingsSchema,
} from "@/validators/settings";
import { clerkClient, type User as ClerkUser } from "@clerk/nextjs/server";
import { PAYLOAD_TOO_LARGE_CODE } from "@/lib/constants";

export const modifyRegistrationData = authenticatedAction
	.schema(registrationSettingsFormValidator)
	.action(
		async ({
			parsedInput: {
				age,
				firstTimeAttendingRCC,
				isPresenting,
				presentationName,
				university,
				major,
				classification,
				universityEmail,
				company,
				title,
				organizerGroup,
				heardFrom,
				shirtSize,
				dietRestrictions,
				accommodationNote,
			},
			ctx: { userId },
		}) => {
			await Promise.all([
				// attempts to update both tables with Promise.all
				db
					.update(userCommonData)
					.set({
						age,
						shirtSize,
						firstTimeAttendingRCC,
						isPresenting,
						dietRestrictions: dietRestrictions,
						accommodationNote,
					})
					.where(eq(userCommonData.clerkID, userId)),
				db
					.update(userMetaData)
					.set({
						presentationName,
						university,
						major,
						classification,
						universityEmail,
						company,
						title,
						organizerGroup,
						heardFrom,
					})
					.where(eq(userMetaData.clerkID, userId)),
			]).catch(async (err) => {
				return {
					success: false,
				};
			});
			return {
				success: true,
				newAge: age,
				newFirstTimeAttendingRCC: firstTimeAttendingRCC,
				newIsPresenting: isPresenting,
				newPresentationName: presentationName,
				newUniversity: university,
				newMajor: major,
				newClassification: classification,
				newUniversityEmail: universityEmail,
				newCompany: company,
				newTitle: title,
				newOrganizerGroup: organizerGroup,
				newHeardFrom: heardFrom,
				newShirtSize: shirtSize,
				newDietaryRestrictions: dietRestrictions,
				newAccommodationNote: accommodationNote,
			};
		},
	);

export const deleteResume = authenticatedAction
	.schema(
		z.object({
			oldFileLink: z.string(),
		}),
	)
	.action(async ({ parsedInput: { oldFileLink } }) => {
		if (oldFileLink === c.noResumeProvidedURL) return null;
		await del(oldFileLink);
	});

export const modifyAccountSettings = authenticatedAction
	.schema(modifyAccountSettingsSchema)
	.action(
		async ({
			parsedInput: { firstName, lastName, hackerTag },
			ctx: { userId },
		}) => {
			try {
				await db
					.update(userCommonData)
					.set({
						firstName,
						lastName,
						hackerTag,
					})
					.where(eq(userCommonData.clerkID, userId));
			} catch (err) {
				console.log("modifyAccountSettings error is", err);
				if (
					err instanceof DatabaseError &&
					err.code === UNIQUE_KEY_CONSTRAINT_VIOLATION_CODE
				) {
					return {
						success: false,
						message: "hackertag_not_unique",
					};
				}
				throw err;
			}
			return {
				success: true,
				newFirstName: firstName,
				newLastName: lastName,
			};
		},
	);

// come back and fix this tmr
export const updateProfileImage = authenticatedAction
	.schema(z.object({ fileBase64: z.string(), fileName: z.string() }))
	.action(
		async ({ parsedInput: { fileBase64, fileName }, ctx: { userId } }) => {
			const file = await decodeBase64AsFile(fileBase64, fileName);
			let clerkUser: ClerkUser;
			try {
				clerkUser = await (
					await clerkClient()
				).users.updateUserProfileImage(userId, {
					file,
				});
			} catch (err) {
				console.log(`Error updating Clerk profile image: ${err}`);
				if (
					typeof err === "object" &&
					err != null &&
					"status" in err &&
					err.status === PAYLOAD_TOO_LARGE_CODE
				) {
					return {
						success: false,
						message: "file_too_large",
					};
				}
				console.log(
					`Unknown Error updating Clerk profile image: ${err}`,
				);
				throw err;
			}

			await db
				.update(userCommonData)
				.set({ profilePhoto: clerkUser.imageUrl })
				.where(eq(userCommonData.clerkID, userId));
			revalidatePath("/settings#profile");
			return { success: true };
		},
	);
