CREATE TABLE `workspace_records` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE INDEX `records_owner_project` ON `workspace_records` (`owner`,`project_id`);
--> statement-breakpoint
DROP INDEX `projects_owner_free_quota`;
--> statement-breakpoint
CREATE INDEX `projects_owner` ON `projects` (`owner`);