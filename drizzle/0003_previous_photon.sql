RENAME TABLE `zoltar_conversations` TO `oracle_conversations`;--> statement-breakpoint
RENAME TABLE `zoltar_messages` TO `oracle_messages`;--> statement-breakpoint
ALTER TABLE `oracle_conversations` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `oracle_messages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `oracle_messages` MODIFY COLUMN `role` enum('user','oracle') NOT NULL;--> statement-breakpoint
ALTER TABLE `oracle_conversations` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `oracle_messages` ADD PRIMARY KEY(`id`);