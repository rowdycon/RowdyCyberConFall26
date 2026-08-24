import { db, eq } from "..";
import { userMetaData, userCommonData } from "../schema";
import { UserMetaData, Participant } from "../types";

export function getAllUsersCommonDataWithRole() {
	return db.query.userCommonData.findMany({
		with: {
			role: true,
		},
	});
}

export function getAllUsersCommonDataWithMetaData(): Promise<
	Participant[] | undefined
> {
	return db.query.userCommonData.findMany({
		with: { userMetaData: true },
	});
}

export function getUserCommonData(clerkID: string) {
	return db.query.userCommonData.findFirst({
		where: (fields, { eq }) => eq(fields.clerkID, clerkID),
		with: {
			role: true,
		},
	});
}

export function getUserCommonDataByTag(hackerTag: string) {
	return db.query.userCommonData.findFirst({
		where: eq(userCommonData.hackerTag, hackerTag),
		with: { userMetaData: true, role: true },
	});
}

export function getUserMetaData(
	clerkID: string,
): Promise<UserMetaData | undefined> {
	return db.query.userMetaData.findFirst({
		where: eq(userMetaData.clerkID, clerkID),
	});
}

export function updateUserResume(userID: string, url: string) {
	return db
		.update(userMetaData)
		.set({
			resume: url,
		})
		.where(eq(userMetaData.clerkID, userID));
}
