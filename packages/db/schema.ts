import {
	integer,
	text,
	sqliteTable,
	customType,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const uuid = customType<{ data: string; notNull: true; default: true }>({
	dataType() {
		return "text";
	},
	toDriver() {
		return nanoid();
	},
});

export const fileTypesEnum = customType<{
	data: "resume" | "profilePhoto";
	notNull: true;
	default: true;
}>({
	dataType() {
		return "text";
	},
	toDriver(value) {
		return value;
	},
});

export const chatType = customType<{
	data: "ticket";
	notNull: true;
	default: true;
}>({
	dataType() {
		return "text";
	},
	toDriver(value) {
		return value;
	},
});

export const userCommonData = sqliteTable("user_common_data", {
	clerkID: text("clerk_id", { length: 255 }).primaryKey(),
	firstName: text("first_name", { length: 50 }).notNull(),
	lastName: text("last_name", { length: 50 }).notNull(),
	email: text("email", { length: 255 }).notNull().unique(),
	age: integer("age").notNull(),
	hackerTag: text("hacker_tag", { length: 50 }).notNull().unique(),
	firstTimeAttendingRCC: integer("firstTimeAttendingRCC", { mode: "boolean" })
		.notNull()
		.default(true),
	attendeeType: text("attendeeType", { length: 50 }).notNull(),
	isPresenting: integer("isPresenting", { mode: "boolean" })
		.notNull()
		.default(false),
	shirtSize: text("shirt_size", { length: 5 }).notNull(),
	dietRestrictions: text("diet_restrictions", { mode: "json" })
		.notNull()
		.$type<string[]>()
		.default([]),
	accommodationNote: text("accommodation_note"),
	acknowledgement: integer("acknowledgement", { mode: "boolean" })
		.notNull()
		.default(false),
	profilePhoto: text("profile_photo", { length: 255 }).notNull(),

	// metadata
	isFullyRegistered: integer("is_fully_registered", { mode: "boolean" })
		.notNull()
		.default(false),
	signupTime: integer("signup_time", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	role_id: integer("role_id")
		.notNull()
		.references(() => roles.id),
	checkinTimestamp: integer("checkin_timestamp", { mode: "timestamp_ms" }),
	isRSVPed: integer("is_rsvped", { mode: "boolean" })
		.notNull()
		.default(false),
	isApproved: integer("is_approved", { mode: "boolean" })
		.notNull()
		.default(false),
});

export const roles = sqliteTable("roles", {
	id: integer("id").primaryKey(),
	name: text("name", { length: 50 }).notNull().unique(),
	position: integer("position").notNull(), // lower value = higher role (0 = highest)
	permissions: integer("permissions", { mode: "number" }).notNull(), // 32-bit mask
	color: text("color", { length: 7 }), // e.g. #RRGGBB
});

export const rolesRelations = relations(roles, ({ many }) => ({
	users: many(userCommonData),
}));

export const userCommonRelations = relations(
	userCommonData,
	({ one, many }) => ({
		userMetaData: one(userMetaData, {
			fields: [userCommonData.clerkID],
			references: [userMetaData.clerkID],
		}),

		files: many(files),
		scans: many(scans),
		banInstance: one(bannedUsers, {
			fields: [userCommonData.clerkID],
			references: [bannedUsers.userID],
		}),
		role: one(roles, {
			fields: [userCommonData.role_id],
			references: [roles.id],
		}),
	}),
);

export const userMetaData = sqliteTable("user_meta_data", {
	clerkID: text("clerk_id", { length: 255 })
		.primaryKey()
		.references(() => userCommonData.clerkID, { onDelete: "cascade" }),
	university: text("university"),
	major: text("major"),
	classification: text("classification"),
	universityEmail: text("universityEmail").unique(),
	company: text("company"),
	title: text("title"),
	organizerGroup: text("organizerGroup", { length: 50 }),
	presentationName: text("presentationName", { length: 255 }),
	heardFrom: text("heard_from", { length: 50 }).notNull(),
	resume: text("resume", { length: 255 })
		.notNull()
		.default("https://static.acmutsa.org/No%20Resume%20Provided.pdf"),
});

export const userMetaRelations = relations(userMetaData, ({ one, many }) => ({
	commonData: one(userCommonData, {
		fields: [userMetaData.clerkID],
		references: [userCommonData.clerkID],
	}),
}));

export const bannedUsers = sqliteTable("banned_users", {
	id: integer("id", { mode: "number" }).notNull().primaryKey(),
	userID: text("user_id", { length: 255 })
		.notNull()
		.references(() => userCommonData.clerkID, { onDelete: "cascade" }),
	reason: text("reason"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	bannedByID: text("banned_by_id", { length: 255 })
		.notNull()
		.references(() => userCommonData.clerkID, { onDelete: "cascade" }),
});

export const events = sqliteTable("events", {
	id: integer("id", { mode: "number" }).notNull().primaryKey(),
	title: text("name", { length: 255 }).notNull(),
	startTime: integer("start_time", { mode: "timestamp_ms" }).notNull(),
	endTime: integer("end_time", { mode: "timestamp_ms" }).notNull(),
	location: text("location", { length: 255 }).default("TBD"),
	description: text("description").notNull(),
	type: text("type", { length: 50 }).notNull(),
	host: text("host", { length: 255 }),
	hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
});

export const eventsRelations = relations(events, ({ many }) => ({
	scans: many(scans),
}));

export const files = sqliteTable("files", {
	id: text("id", { length: 255 }).notNull().primaryKey().unique(),
	presignedURL: text("presigned_url").notNull(),
	key: text("key", { length: 500 }).notNull().unique(),
	validated: integer("validated", { mode: "boolean" })
		.notNull()
		.default(false),
	type: fileTypesEnum("type").notNull(),
	ownerID: text("owner_id", { length: 255 }).notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
	owner: one(userCommonData, {
		fields: [files.ownerID],
		references: [userCommonData.clerkID],
	}),
}));

export const scans = sqliteTable(
	"scans",
	{
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(current_timestamp)`),
		userID: text("user_id", { length: 255 }).notNull(),
		eventID: integer("event_id").notNull(),
		count: integer("count").notNull(),
	},
	(table) => [primaryKey({ columns: [table.userID, table.eventID] })],
);

export const scansRelations = relations(scans, ({ one }) => ({
	user: one(userCommonData, {
		fields: [scans.userID],
		references: [userCommonData.clerkID],
	}),
	event: one(events, {
		fields: [scans.eventID],
		references: [events.id],
	}),
}));

export const errorLog = sqliteTable("error_log", {
	id: text("id", { length: 50 }).notNull().primaryKey(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	userID: text("user_id", { length: 255 }),
	route: text("route", { length: 255 }),
	message: text("message").notNull(),
});
