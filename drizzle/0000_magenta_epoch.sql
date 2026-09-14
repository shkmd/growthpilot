CREATE TABLE `audit_limits` (
	`owner` text PRIMARY KEY NOT NULL,
	`last_started` integer NOT NULL,
	`day` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`owner` text NOT NULL,
	`created_at` text NOT NULL,
	`score` integer NOT NULL,
	`result` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audits_owner_project_date` ON `audits` (`owner`,`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`country` text NOT NULL,
	`language` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_owner_free_quota` ON `projects` (`owner`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`priority` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tasks_owner_project` ON `tasks` (`owner`,`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_deduplicate` ON `tasks` (`project_id`,`title`);