DROP TABLE IF EXISTS `todos`;
CREATE TABLE IF NOT EXISTS `todos` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`title`	varchar,
	`completed`	boolean,
	`day`	varchar,
	`month`	varchar,
	`year`	varchar,
	`description`	text
);
