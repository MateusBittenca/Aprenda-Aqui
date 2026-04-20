-- Bases EXISTENTES com Track / UserTrackEnrollment: execute com backup antes.
-- Bases novas: não use este arquivo; rode `npx prisma db push` (ou migrate) só com schema.prisma atual.

ALTER TABLE `Course`
  ADD COLUMN `tagline` VARCHAR(160) NULL,
  ADD COLUMN `coverImageUrl` VARCHAR(2048) NULL,
  ADD COLUMN `overviewMd` LONGTEXT NULL;

UPDATE `Course` c
INNER JOIN `Track` t ON c.`trackId` = t.`id`
SET
  c.`tagline` = t.`tagline`,
  c.`coverImageUrl` = t.`coverImageUrl`,
  c.`overviewMd` = t.`overviewMd`,
  c.`orderIndex` = t.`orderIndex` * 100000 + c.`orderIndex`;

UPDATE `Course` c
INNER JOIN `Track` t ON c.`trackId` = t.`id`
INNER JOIN (
  SELECT `slug` FROM `Course` GROUP BY `slug` HAVING COUNT(DISTINCT `trackId`) > 1
) dup ON dup.`slug` = c.`slug`
SET c.`slug` = CONCAT(c.`slug`, '-', t.`slug`);

INSERT INTO `UserCourseEnrollment` (`id`, `userId`, `courseId`, `enrolledAt`)
SELECT REPLACE(UUID(), '-', ''), ute.`userId`, c.`id`, ute.`enrolledAt`
FROM `UserTrackEnrollment` ute
INNER JOIN `Course` c ON c.`trackId` = ute.`trackId` AND c.`isFree` = 1
LEFT JOIN `UserCourseEnrollment` ex
  ON ex.`userId` = ute.`userId` AND ex.`courseId` = c.`id`
WHERE ex.`id` IS NULL;

SET @fk := (
  SELECT `CONSTRAINT_NAME`
  FROM `information_schema`.`KEY_COLUMN_USAGE`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'Course'
    AND `COLUMN_NAME` = 'trackId'
    AND `REFERENCED_TABLE_NAME` = 'Track'
  LIMIT 1
);
SET @dropfk := IF(@fk IS NOT NULL, CONCAT('ALTER TABLE `Course` DROP FOREIGN KEY `', @fk, '`'), 'SELECT 1');
PREPARE dfk FROM @dropfk;
EXECUTE dfk;
DEALLOCATE PREPARE dfk;

ALTER TABLE `Course` DROP INDEX `Course_trackId_slug_key`;
ALTER TABLE `Course` DROP INDEX `Course_trackId_idx`;
ALTER TABLE `Course` DROP COLUMN `trackId`;

DROP TABLE `UserTrackEnrollment`;
DROP TABLE `Track`;

CREATE UNIQUE INDEX `Course_slug_key` ON `Course`(`slug`);
