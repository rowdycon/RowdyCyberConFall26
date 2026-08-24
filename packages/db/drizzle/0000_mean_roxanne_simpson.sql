CREATE TABLE `banned_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text(255) NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`banned_by_id` text(255) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_common_data`(`clerk_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`banned_by_id`) REFERENCES `user_common_data`(`clerk_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `error_log` (
	`id` text(50) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user_id` text(255),
	`route` text(255),
	`message` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`location` text(255) DEFAULT 'TBD',
	`description` text NOT NULL,
	`type` text(50) NOT NULL,
	`host` text(255),
	`hidden` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`presigned_url` text NOT NULL,
	`key` text(500) NOT NULL,
	`validated` integer DEFAULT false NOT NULL,
	`type` text NOT NULL,
	`owner_id` text(255) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_id_unique` ON `files` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `files_key_unique` ON `files` (`key`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`position` integer NOT NULL,
	`permissions` integer NOT NULL,
	`color` text(7)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `scans` (
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user_id` text(255) NOT NULL,
	`event_id` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`user_id`, `event_id`)
);
--> statement-breakpoint
CREATE TABLE `user_common_data` (
	`clerk_id` text(255) PRIMARY KEY NOT NULL,
	`first_name` text(50) NOT NULL,
	`last_name` text(50) NOT NULL,
	`email` text(255) NOT NULL,
	`age` integer NOT NULL,
	`hacker_tag` text(50) NOT NULL,
	`firstTimeAttendingRCC` integer DEFAULT true NOT NULL,
	`attendeeType` text(50) NOT NULL,
	`isPresenting` integer DEFAULT false NOT NULL,
	`shirt_size` text(5) NOT NULL,
	`diet_restrictions` text DEFAULT '[]' NOT NULL,
	`accommodation_note` text,
	`acknowledgement` integer DEFAULT false NOT NULL,
	`profile_photo` text(255) NOT NULL,
	`is_fully_registered` integer DEFAULT false NOT NULL,
	`signup_time` integer DEFAULT (current_timestamp) NOT NULL,
	`role_id` integer NOT NULL,
	`checkin_timestamp` integer,
	`is_rsvped` integer DEFAULT false NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_common_data_email_unique` ON `user_common_data` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_common_data_hacker_tag_unique` ON `user_common_data` (`hacker_tag`);--> statement-breakpoint
CREATE TABLE `user_meta_data` (
	`clerk_id` text(255) PRIMARY KEY NOT NULL,
	`university` text,
	`major` text,
	`classification` text,
	`universityEmail` text,
	`company` text,
	`title` text,
	`organizerGroup` text(50),
	`presentationName` text(255),
	`heard_from` text(50) NOT NULL,
	`resume` text(255) DEFAULT 'https://static.acmutsa.org/No%20Resume%20Provided.pdf' NOT NULL,
	FOREIGN KEY (`clerk_id`) REFERENCES `user_common_data`(`clerk_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_meta_data_universityEmail_unique` ON `user_meta_data` (`universityEmail`);
--> statement-breakpoint
INSERT INTO `roles` (name, position, permissions, color)
VALUES ('super_admin', 0, -1, '#FF0000'), 
('admin', 1, 8099, '#05CC12'),
('participant', 2, 0, '#000000');