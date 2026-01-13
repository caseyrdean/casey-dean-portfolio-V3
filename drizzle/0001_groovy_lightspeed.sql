CREATE TABLE `blog_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int,
	`filename` varchar(500) NOT NULL,
	`originalName` varchar(500) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`url` varchar(1000) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`type` enum('image','document','video') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blog_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImage` varchar(1000),
	`category` varchar(100),
	`tags` json,
	`readTime` varchar(50),
	`published` boolean NOT NULL DEFAULT false,
	`authorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
