-- Add Email Verification and Password Reset columns to users table
-- This migration adds the missing columns needed for email verification and password reset features

ALTER TABLE `users` ADD COLUMN `emailVerificationToken` VARCHAR(255) NULL DEFAULT NULL AFTER `badges`;
ALTER TABLE `users` ADD COLUMN `emailVerificationTokenExpire` DATETIME NULL DEFAULT NULL AFTER `emailVerificationToken`;
ALTER TABLE `users` ADD COLUMN `passwordResetToken` VARCHAR(255) NULL DEFAULT NULL AFTER `emailVerificationTokenExpire`;
ALTER TABLE `users` ADD COLUMN `passwordResetTokenExpire` DATETIME NULL DEFAULT NULL AFTER `passwordResetToken`;

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
ORDER BY ORDINAL_POSITION;
