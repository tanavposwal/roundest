CREATE TABLE `r_pokemon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255)
);
--> statement-breakpoint
CREATE TABLE `r_vote` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`votedforid` integer NOT NULL,
	`votedagainstid` integer NOT NULL,
	FOREIGN KEY (`votedforid`) REFERENCES `r_pokemon`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`votedagainstid`) REFERENCES `r_pokemon`(`id`) ON UPDATE no action ON DELETE no action
);
