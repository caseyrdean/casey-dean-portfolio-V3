CREATE TABLE `document_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`content` text NOT NULL,
	`chunkIndex` int NOT NULL,
	`startOffset` int,
	`endOffset` int,
	`embedding` json,
	`tokenCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(500) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`mimeType` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`url` varchar(1000) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`docType` enum('resume','project','bio','skills','experience','other') NOT NULL DEFAULT 'other',
	`active` boolean NOT NULL DEFAULT true,
	`rawContent` text,
	`chunkCount` int DEFAULT 0,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zoltar_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zoltar_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zoltar_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','zoltar') NOT NULL,
	`content` text NOT NULL,
	`sourceChunkIds` json,
	`hasKnowledge` boolean,
	`responseTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zoltar_messages_id` PRIMARY KEY(`id`)
);
