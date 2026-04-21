-- Tabela de desbloqueio de explicação (1 gema). Execute se o ambiente não usar `prisma migrate` / `db push`.
CREATE TABLE IF NOT EXISTS `UserExerciseExplanationUnlock` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `exerciseId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserExerciseExplanationUnlock_userId_exerciseId_key` (`userId`, `exerciseId`),
  INDEX `UserExerciseExplanationUnlock_userId_idx` (`userId`),
  CONSTRAINT `UserExerciseExplanationUnlock_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserExerciseExplanationUnlock_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
