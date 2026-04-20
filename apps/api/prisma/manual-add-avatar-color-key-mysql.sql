-- Execute no MySQL se a coluna ainda não existir (ex.: ambientes sem `prisma db push`).
ALTER TABLE `User`
  ADD COLUMN `avatarColorKey` VARCHAR(16) NOT NULL DEFAULT 'auto' AFTER `showInSearch`;
