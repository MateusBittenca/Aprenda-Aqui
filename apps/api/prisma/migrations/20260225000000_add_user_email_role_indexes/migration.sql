-- Add explicit index on User.email for login query performance
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- Add explicit index on User.role for role-based filtering (leaderboard, etc.)
CREATE INDEX `User_role_idx` ON `User`(`role`);
